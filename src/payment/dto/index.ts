import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class PaymentConfirm {
  @ApiProperty({ description: '결제 키' })
  @IsString()
  paymentKey: string;

  @ApiProperty({ description: '주문 ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '결제 금액' })
  @IsNumber()
  amount: number;
}

export class PaymentBeforeHistory {
  @ApiProperty({ description: '주문 ID', example: '1234567890' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '결제 금액', example: 10000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '주문 이름', example: '재매칭권' })
  @IsString()
  orderName: string;
}
