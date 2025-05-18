import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export enum PortonePaymentStatus {
  READY = 'ready',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export class PortoneWebhookDto {
  @ApiProperty({ description: '포트원 결제 고유번호' })
  @IsString()
  imp_uid: string;

  @ApiProperty({ description: '가맹점 주문번호' })
  @IsString()
  merchant_uid: string;

  @ApiProperty({ description: '결제 상태', enum: PortonePaymentStatus })
  @IsEnum(PortonePaymentStatus)
  status: PortonePaymentStatus;
} 