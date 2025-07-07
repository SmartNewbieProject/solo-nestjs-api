import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '@auth/decorators';
import { GemProductViewer } from '../../services/product-viewer.service';
import { GemProductsResponseDto } from '../../docs/gem-products.dto';
import { Role } from '@auth/domain/user-role.enum';
import { AuthenticationUser } from '@/types';
import { PaymentConfirm } from '@/payment/dto';
import { GemPaymentService } from '@/payment/services/gem-payment.service';
import { PortoneWebhookDto } from '@/payment/dto/webhook.dto';
import { Request } from 'express';
import { Webhook } from '@portone/server-sdk';
import { ConfigService } from '@nestjs/config';

@Controller('v1/gem')
@ApiTags('구슬(재화)')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export class GemController {
  constructor(
    private readonly gemProductViewer: GemProductViewer,
    private readonly gemPaymentService: GemPaymentService,
    private readonly secretKey: string,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = configService.get('PORTONE_WEBHOOK_SECRET') as string;
  }

  @Get('products')
  @ApiOperation({ summary: '구슬 상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '구슬 상품 목록 조회 성공',
    type: GemProductsResponseDto,
  })
  async getGemProducts() {
    return await this.gemProductViewer.getAvailableProducts();
  }

  @ApiOperation({
    summary: '구슬(재화) 결제 내용 서버 저장',
    description:
      'PortOne 으로부터 결제창 이후 전달받은 값을 서버로 전송해 교차검증을 진행합니다.',
  })
  @Post('confirm')
  async confirmPayment(
    @CurrentUser() user: AuthenticationUser,
    @Body() payment: PaymentConfirm,
  ) {
    return await this.gemPaymentService.confirm(user.id, payment);
  }

  @ApiOperation({ summary: '포트원 결제 웹훅' })
  @ApiHeader({ name: 'Portone-Signature' })
  @Post('webhook')
  @Public()
  async handleWebhook(
    @Headers('webhook-id') webhookId: string,
    @Headers('webhook-signature') webhookSignature: string,
    @Headers('webhook-timestamp') webhookTimestamp: string,
    @Body() webhookData: PortoneWebhookDto,
    @Req() req: Request,
  ) {
    await this.verifyPortoneWebhook(
      req,
      webhookId,
      webhookSignature,
      webhookTimestamp,
    );

    this.gemPaymentService.handleWebHook(webhookData);
  }

  private async verifyPortoneWebhook(
    req: Request,
    webhookId: string,
    webhookSignature: string,
    webhookTimestamp: string,
  ) {
    if (!this.secretKey) {
      throw new UnauthorizedException('Webhook 시크릿이 설정되지 않았습니다.');
    }
    const headers = {
      'webhook-id': webhookId,
      'webhook-signature': webhookSignature,
      'webhook-timestamp': webhookTimestamp,
    };
    const payload = JSON.stringify(req.body);
    const verified = await Webhook.verify(this.secretKey, payload, headers);
    if (!verified) {
      throw new UnauthorizedException(
        '유효하지 않은 포트원 Webhook 요청입니다.',
      );
    }
  }
}
