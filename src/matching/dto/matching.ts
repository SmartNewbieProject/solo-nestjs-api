import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdminMatchRequest {
  @ApiProperty({ description: '사용자 ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '최대 매칭 조회 대상 수' })
  @IsNumber()
  limit: number;
}

export class AdminMatchSingleRequest {
  @ApiProperty({ description: '사용자 ID' })
  @IsString()
  userId: string;
}

export class AdminMatchSimulationRequest {
  @ApiProperty({ description: '사용자 ID' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '매칭 시뮬레이션 결과 수 (기본값: 5)',
    required: false,
    default: 5,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
