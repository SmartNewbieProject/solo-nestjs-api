import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

/**
 * 기간별 매출 요청 DTO
 */
export class CustomPeriodSalesRequest {
  @ApiProperty({
    description: '시작 날짜 (YYYY-MM-DD 형식)',
    example: '2025-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '종료 날짜 (YYYY-MM-DD 형식)',
    example: '2025-04-23',
  })
  @IsDateString()
  endDate: string;
}

/**
 * 매출 추이 포인트
 */
export class SalesTrendPoint {
  @ApiProperty({
    description: '날짜 또는 기간 라벨',
    example: '2025-04-22',
  })
  label: string;

  @ApiProperty({
    description: '해당 기간의 매출액',
    example: 50000,
  })
  amount: number;

  @ApiProperty({
    description: '해당 기간의 결제 건수',
    example: 5,
  })
  count: number;
}

/**
 * 일별 매출 추이 응답 DTO
 */
export class DailySalesTrendResponse {
  @ApiProperty({
    description: '일별 매출 추이 데이터',
    type: [SalesTrendPoint],
  })
  data: SalesTrendPoint[];
}

/**
 * 주별 매출 추이 응답 DTO
 */
export class WeeklySalesTrendResponse {
  @ApiProperty({
    description: '주별 매출 추이 데이터',
    type: [SalesTrendPoint],
  })
  data: SalesTrendPoint[];
}

/**
 * 월별 매출 추이 응답 DTO
 */
export class MonthlySalesTrendResponse {
  @ApiProperty({
    description: '월별 매출 추이 데이터',
    type: [SalesTrendPoint],
  })
  data: SalesTrendPoint[];
}

/**
 * 사용자 지정 기간 매출 추이 응답 DTO
 */
export class CustomPeriodSalesTrendResponse {
  @ApiProperty({
    description: '시작 날짜',
    example: '2025-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2025-04-23',
  })
  endDate: string;

  @ApiProperty({
    description: '사용자 지정 기간 매출 추이 데이터',
    type: [SalesTrendPoint],
  })
  data: SalesTrendPoint[];
}

/**
 * 결제 성공률 응답 DTO
 */
export class PaymentSuccessRateResponse {
  @ApiProperty({
    description: '기준 날짜',
    example: '2025-04-23',
  })
  date: string;

  @ApiProperty({
    description: '총 결제 시도 건수',
    example: 100,
  })
  totalAttempts: number;

  @ApiProperty({
    description: '성공한 결제 건수',
    example: 95,
  })
  successfulPayments: number;

  @ApiProperty({
    description: '결제 성공률 (%)',
    example: 95.0,
  })
  successRate: number;
}
