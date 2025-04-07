import { Body, Controller, Post, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentConfirm } from '../dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import got from 'got';

@Controller('payments')
@ApiTags('결제')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
export class PaymentController {
  private readonly clientKey: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.clientKey = Buffer.from(this.configService.get<string>('TOSS_PAYMENTS_SECRET_KEY') + ':').toString('base64');
  }

  @ApiOperation({ summary: '결제 승인 API' })
  @Post('confirm')
  async confirmPayment(@Body() paymentData: PaymentConfirm) {
    try {
      const result = await got.post('https://api.tosspayments.com/v1/payments/confirm', {
        headers: {
          Authorization: `Basic ${this.clientKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
        }),
      });

      return result;
    } catch (error) {
      if (error instanceof got.HTTPError) {
        const errorBody = JSON.parse(error.response.body as string);
        throw new HttpException(errorBody, error.response.statusCode);
      }
      throw new HttpException('결제 처리 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
