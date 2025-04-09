import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { TicketStatus, TicketType } from '@/types/match';
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

export class TicketSummarySchema {
  @ApiProperty({ description: '티켓 ID' })
  id: string;

  @ApiProperty({ description: '티켓 상태', enum: Object.values(TicketStatus) })
  status: TicketStatus;

  @ApiProperty({ description: '티켓 이름' })
  name: string;

  @ApiProperty({ description: '티켓 타입', enum: Object.values(TicketType) })
  type: TicketType;

  @ApiProperty({ description: '티켓 만료일', nullable: true })
  expiredAt: Date | null;

  @ApiProperty({ description: '티켓 생성일' })
  createdAt: Date;
}
