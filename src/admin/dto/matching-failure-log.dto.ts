import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MatchingFailureLogResponse {
  @ApiProperty({ description: '로그 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '실패 사유' })
  reason: string;

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;
}

export class GetMatchingFailureLogsQuery {
  @ApiProperty({ description: '사용자 ID (선택적)', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}
