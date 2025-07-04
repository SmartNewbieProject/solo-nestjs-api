import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Email {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;
}
