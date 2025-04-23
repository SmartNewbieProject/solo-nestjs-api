import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { WithdrawalReason, withdrawalReasonDisplayNames } from '@/types/withdrawal';

/**
 * 기간별 탈퇴자 수 요청 DTO
 */
export class CustomPeriodWithdrawalRequest {
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
 * 탈퇴 추이 포인트
 */
export class WithdrawalTrendPoint {
  @ApiProperty({
    description: '날짜 또는 기간 라벨',
    example: '2025-04-22',
  })
  label: string;

  @ApiProperty({
    description: '해당 기간의 탈퇴자 수',
    example: 5,
  })
  count: number;
}

/**
 * 일별 탈퇴 추이 응답 DTO
 */
export class DailyWithdrawalTrendResponse {
  @ApiProperty({
    description: '일별 탈퇴 추이 데이터',
    type: [WithdrawalTrendPoint],
  })
  data: WithdrawalTrendPoint[];
}

/**
 * 주별 탈퇴 추이 응답 DTO
 */
export class WeeklyWithdrawalTrendResponse {
  @ApiProperty({
    description: '주별 탈퇴 추이 데이터',
    type: [WithdrawalTrendPoint],
  })
  data: WithdrawalTrendPoint[];
}

/**
 * 월별 탈퇴 추이 응답 DTO
 */
export class MonthlyWithdrawalTrendResponse {
  @ApiProperty({
    description: '월별 탈퇴 추이 데이터',
    type: [WithdrawalTrendPoint],
  })
  data: WithdrawalTrendPoint[];
}

/**
 * 사용자 지정 기간 탈퇴 추이 응답 DTO
 */
export class CustomPeriodWithdrawalTrendResponse {
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
    description: '사용자 지정 기간 탈퇴 추이 데이터',
    type: [WithdrawalTrendPoint],
  })
  data: WithdrawalTrendPoint[];
}

/**
 * 탈퇴 사유 통계 항목
 */
export class WithdrawalReasonStatItem {
  @ApiProperty({
    description: '탈퇴 사유 코드',
    enum: WithdrawalReason,
    example: WithdrawalReason.INACTIVE_USAGE,
  })
  reason: WithdrawalReason;

  @ApiProperty({
    description: '탈퇴 사유 표시 이름',
    example: '서비스를 잘 사용하지 않아서',
  })
  displayName: string;

  @ApiProperty({
    description: '해당 사유로 탈퇴한 사용자 수',
    example: 42,
  })
  count: number;

  @ApiProperty({
    description: '전체 탈퇴자 중 비율 (%)',
    example: 35.6,
  })
  percentage: number;
}

/**
 * 탈퇴 사유 통계 응답 DTO
 */
export class WithdrawalReasonStatsResponse {
  @ApiProperty({
    description: '전체 탈퇴자 수',
    example: 118,
  })
  totalWithdrawals: number;

  @ApiProperty({
    description: '탈퇴 사유별 통계',
    type: [WithdrawalReasonStatItem],
  })
  reasons: WithdrawalReasonStatItem[];
}

/**
 * 서비스 사용 기간 통계 항목
 */
export class ServiceDurationStatItem {
  @ApiProperty({
    description: '서비스 사용 기간 범위',
    example: '0-7일',
  })
  range: string;

  @ApiProperty({
    description: '해당 기간 동안 서비스를 사용한 탈퇴자 수',
    example: 15,
  })
  count: number;

  @ApiProperty({
    description: '전체 탈퇴자 중 비율 (%)',
    example: 12.7,
  })
  percentage: number;
}

/**
 * 서비스 사용 기간 통계 응답 DTO
 */
export class ServiceDurationStatsResponse {
  @ApiProperty({
    description: '전체 탈퇴자 수',
    example: 118,
  })
  totalWithdrawals: number;

  @ApiProperty({
    description: '평균 서비스 사용 기간 (일)',
    example: 45.3,
  })
  averageDurationDays: number;

  @ApiProperty({
    description: '서비스 사용 기간별 통계',
    type: [ServiceDurationStatItem],
  })
  durations: ServiceDurationStatItem[];
}

/**
 * 이탈률 통계 응답 DTO
 */
export class ChurnRateResponse {
  @ApiProperty({
    description: '기준 날짜',
    example: '2025-04-23',
  })
  date: string;

  @ApiProperty({
    description: '일간 이탈률 (%)',
    example: 0.5,
  })
  dailyChurnRate: number;

  @ApiProperty({
    description: '주간 이탈률 (%)',
    example: 2.3,
  })
  weeklyChurnRate: number;

  @ApiProperty({
    description: '월간 이탈률 (%)',
    example: 8.7,
  })
  monthlyChurnRate: number;
}
