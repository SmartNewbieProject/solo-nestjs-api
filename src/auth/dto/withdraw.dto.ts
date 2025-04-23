import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WithdrawalReason, withdrawalReasonDisplayNames } from '@/types/withdrawal';

export class WithdrawRequest {
  @ApiProperty({
    description: '비밀번호',
    example: '@Password123!',
  })
  @IsString({ message: '비밀번호는 문자열로 입력해주세요.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  password: string;

  @ApiProperty({
    description: '탈퇴 사유',
    enum: WithdrawalReason,
    example: WithdrawalReason.INACTIVE_USAGE,
    enumName: 'WithdrawalReason',
  })
  @IsEnum(WithdrawalReason, { message: '유효한 탈퇴 사유를 선택해주세요.' })
  @IsNotEmpty({ message: '탈퇴 사유는 필수 입력 항목입니다.' })
  reason: WithdrawalReason;

  @ApiProperty({
    description: '상세 사유 (선택 사항)',
    example: '매칭이 잘 되지 않아서 탈퇴합니다.',
    required: false,
  })
  @IsString({ message: '상세 사유는 문자열로 입력해주세요.' })
  @IsOptional()
  detail?: string;
}
