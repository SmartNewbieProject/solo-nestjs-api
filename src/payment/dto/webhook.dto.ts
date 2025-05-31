import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export enum PortonePaymentStatus {
  READY = 'Ready',
  PAID = 'Paid',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
  PayPending = 'PayPending',
  CancelPending = 'CancelPending',
}

export class PortoneWebhookDto {
  @ApiProperty({ description: '포트원 결제 고유번호' })
  @IsString()
  payment_id: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  @IsString()
  tx_id: string;

  @ApiProperty({ description: '결제 상태', enum: PortonePaymentStatus })
  @IsEnum(PortonePaymentStatus)
  status: PortonePaymentStatus;
} 