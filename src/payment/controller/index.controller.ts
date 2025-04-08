import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentBeforeHistory, PaymentConfirm } from '../dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import PayService from '../services/pay.service';

@Controller('payments')
@ApiTags('결제')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
export class PaymentController {
  constructor(private readonly payService: PayService) {}

  @ApiOperation({ summary: '결제 전 증빙 기록' })
  @Post('history')
  async history(@CurrentUser() user: AuthenticationUser, @Body() payBeforeHistory: PaymentBeforeHistory) {
    return this.payService.createHistory({
      userId: user.id,
      ...payBeforeHistory
    });
  }

  @ApiOperation({ summary: '결제 승인' })
  @Post('confirm')
  async confirmPayment(@CurrentUser() user: AuthenticationUser, @Body() paymentData: PaymentConfirm) {
    return this.payService.pay(user.id, paymentData);
  }

}
