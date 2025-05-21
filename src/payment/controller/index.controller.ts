import { Body, Controller, HttpCode, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentBeforeHistory, PaymentConfirm } from '../dto';
import { PortoneWebhookDto } from '../dto/webhook.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { Public } from '@/auth/decorators/public.decorator';
import PayService from '../services/pay.service';

@Controller('payments')
@ApiTags('결제')
export class PaymentController {
  constructor(private readonly payService: PayService) {}

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
    @Headers('portone-signature') signature: string,
    @Body() webhookData: PortoneWebhookDto,
  ) {
    try {
      // 서명 검증 (필요시 활성화)
      // if (!this.payService.verifyPortoneSignature(signature, webhookData)) {
      //   throw new UnauthorizedException('잘못된 웹훅 서명입니다.');
      // }

      return await this.payService.handlePaymentWebhook(webhookData);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
