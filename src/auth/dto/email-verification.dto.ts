import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class SendEmailVerificationRequest {
  @ApiProperty({
    description: '대학교 이메일 주소',
    example: 'student@cnu.ac.kr',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;
}

export class VerifyEmailCodeRequest {
  @ApiProperty({
    description: '인증 요청 시 받은 요청 ID',
    example: '01234567-89ab-cdef-0123-456789abcdef',
  })
  @IsString({ message: '요청 ID는 문자열이어야 합니다.' })
  requestId: string;

  @ApiProperty({
    description: '6자리 인증번호',
    example: '123456',
  })
  @IsString({ message: '인증번호는 문자열이어야 합니다.' })
  @Length(6, 6, { message: '인증번호는 6자리여야 합니다.' })
  @Matches(/^\d{6}$/, { message: '인증번호는 6자리 숫자여야 합니다.' })
  verificationCode: string;

  @ApiProperty({
    description: '사용자 ID (이메일 인증 완료 시 업데이트할 사용자)',
    example: '01234567-89ab-cdef-0123-456789abcdef',
  })
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  userId: string;
}

export class SendEmailVerificationResponse {
  @ApiProperty({
    description: '인증 요청 ID',
    example: '01234567-89ab-cdef-0123-456789abcdef',
  })
  requestId: string;

  @ApiProperty({
    description: '응답 메시지',
    example: '인증번호가 이메일로 발송되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '인증번호 유효시간 (분)',
    example: 3,
  })
  expiresInMinutes: number;
}

export class VerifyEmailCodeResponse {
  @ApiProperty({
    description: '인증 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '이메일 인증이 완료되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '인증된 이메일 주소',
    example: 'student@cnu.ac.kr',
  })
  email: string;

  @ApiProperty({
    description: '대학교 이름',
    example: '충남대학교',
  })
  universityName: string;
}
