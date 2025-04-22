import { ApiProperty } from '@nestjs/swagger';

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
