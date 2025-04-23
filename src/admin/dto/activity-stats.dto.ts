import { ApiProperty } from '@nestjs/swagger';

/**
 * 시간대별 활성 사용자 분포 DTO
 */
export class HourlyActiveUsersItem {
  @ApiProperty({
    description: '시간대 (0-23)',
    example: 12,
  })
  hour: number;

  @ApiProperty({
    description: '활성 사용자 수',
    example: 42,
  })
  count: number;
}

/**
 * 사용자 활동 지표 응답 DTO
 */
export class UserActivityStatsResponse {
  @ApiProperty({
    description: '현재 활성 사용자 수 (최근 24시간 내 활동)',
    example: 120,
  })
  activeUsers: number;

  @ApiProperty({
    description: '월간 활성 사용자 수 (MAU)',
    example: 500,
  })
  mau: number;

  @ApiProperty({
    description: '주간 활성 사용자 수 (WAU)',
    example: 250,
  })
  wau: number;

  @ApiProperty({
    description: '일간 활성 사용자 수 (DAU)',
    example: 100,
  })
  dau: number;

  @ApiProperty({
    description: '실시간 활성 사용자 수 (최근 30분 내 활동)',
    example: 42,
  })
  realtimeActiveUsers: number;

  @ApiProperty({
    description: '전체 가입자 수',
    example: 1000,
  })
  totalUsers: number;

  @ApiProperty({
    description: '활성화율 (%) - 전체 가입자 중 활성 사용자 비율',
    example: 50.0,
  })
  activationRate: number;

  @ApiProperty({
    description: 'Stickiness (%) - DAU/MAU 비율 (서비스 충성도 지표)',
    example: 20.0,
  })
  stickiness: number;

  @ApiProperty({
    description: '시간대별 활성 사용자 분포',
    type: [HourlyActiveUsersItem],
  })
  hourlyDistribution: HourlyActiveUsersItem[];
}
