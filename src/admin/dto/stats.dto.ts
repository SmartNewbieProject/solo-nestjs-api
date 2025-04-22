import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class SignupTrendPoint {
  @ApiProperty({
    description: '날짜 또는 기간 라벨',
    example: '2025-04-22',
  })
  label: string;

  @ApiProperty({
    description: '해당 기간의 회원가입자 수',
    example: 42,
  })
  count: number;
}

export class DailySignupTrendResponse {
  @ApiProperty({
    description: '일별 회원가입 추이 데이터',
    type: [SignupTrendPoint],
  })
  data: SignupTrendPoint[];
}

export class WeeklySignupTrendResponse {
  @ApiProperty({
    description: '주별 회원가입 추이 데이터',
    type: [SignupTrendPoint],
  })
  data: SignupTrendPoint[];
}

export class MonthlySignupTrendResponse {
  @ApiProperty({
    description: '월별 회원가입 추이 데이터',
    type: [SignupTrendPoint],
  })
  data: SignupTrendPoint[];
}

export class CustomPeriodRequest {
  @ApiProperty({
    description: '시작 날짜 (YYYY-MM-DD 형식)',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '종료 날짜 (YYYY-MM-DD 형식)',
    example: '2025-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class CustomPeriodResponse {
  @ApiProperty({
    description: '사용자 지정 기간 내 회원가입자 수',
    example: 123,
  })
  totalSignups: number;

  @ApiProperty({
    description: '시작 날짜',
    example: '2025-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2025-01-31',
  })
  endDate: string;
}

export class CustomPeriodTrendResponse {
  @ApiProperty({
    description: '사용자 지정 기간 내 일별 회원가입 추이 데이터',
    type: [SignupTrendPoint],
  })
  data: SignupTrendPoint[];

  @ApiProperty({
    description: '시작 날짜',
    example: '2025-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2025-01-31',
  })
  endDate: string;

  @ApiProperty({
    description: '총 회원가입자 수',
    example: 123,
  })
  totalSignups: number;
}

/**
 * 성별 통계 응답 DTO
 */
export class GenderStatsResponse {
  @ApiProperty({
    description: '전체 남성 유저 수',
    example: 75,
  })
  maleCount: number;

  @ApiProperty({
    description: '전체 여성 유저 수',
    example: 48,
  })
  femaleCount: number;

  @ApiProperty({
    description: '총 유저 수',
    example: 123,
  })
  totalCount: number;

  @ApiProperty({
    description: '남성 비율 (%)',
    example: 60.98,
  })
  malePercentage: number;

  @ApiProperty({
    description: '여성 비율 (%)',
    example: 39.02,
  })
  femalePercentage: number;

  @ApiProperty({
    description: '성비 비율 (남성:여성)',
    example: '1.56:1',
  })
  genderRatio: string;
}
