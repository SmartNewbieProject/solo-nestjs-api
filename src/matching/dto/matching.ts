import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

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
