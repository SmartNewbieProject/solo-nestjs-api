import { Body, Controller, HttpCode, Post, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentBeforeHistory, PaymentConfirm } from '../dto';
import { PortoneWebhookDto } from '../dto/webhook.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { Public } from '@/auth/decorators/public.decorator';
import PayService from '../services/pay.service';
import { Webhook } from '@portone/server-sdk';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('payments')
@ApiTags('결제')
export class PaymentController {
  private readonly secretKey: string;

  constructor(
    private readonly payService: PayService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = configService.get('PORTONE_WEBHOOK_SECRET') as string;
  }

  @ApiOperation({ summary: '결제 전 증빙 기록' })
  @Post('history')
  @ApiBearerAuth('access-token')
  @Roles(Role.USER, Role.ADMIN)
  async history(@CurrentUser() user: AuthenticationUser, @Body() payBeforeHistory: PaymentBeforeHistory) {
    return this.payService.createHistory({
      userId: user.id,
      ...payBeforeHistory
    });
  }

  @ApiOperation({ summary: '결제 성공 처리 (클라이언트)' })
  @HttpCode(201)
  @Post('confirm')
  @ApiBearerAuth('access-token')
  @Roles(Role.USER, Role.ADMIN)
  async confirmPayment(@CurrentUser() user: AuthenticationUser, @Body() paymentData: PaymentConfirm) {
    return this.payService.confirmClientPayment(user.id, paymentData);
  }

  @ApiOperation({ summary: '포트원 결제 웹훅' })
  @ApiHeader({ name: 'Portone-Signature' })
  @Post('webhook')
  @Public()
  @HttpCode(200)
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
    return await this.payService.handlePaymentWebhook(webhookData);
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
      throw new UnauthorizedException('유효하지 않은 포트원 Webhook 요청입니다.');
    }
  }
}
