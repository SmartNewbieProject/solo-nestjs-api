import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreSignupDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @IsString()
  @Length(2, 50, { message: '이름은 2~50자 사이여야 합니다.' })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    example: '서울대학교',
    description: '대학교 이름',
  })
  @IsNotEmpty({ message: '대학교 이름은 필수 입력 항목입니다.' })
  @IsString()
  universityName: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '전화번호',
  })
  @IsOptional()
  @IsString()
  @Matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/, {
    message: '유효한 전화번호 형식이 아닙니다.',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'FRIEND_CODE',
    description: '추천인 코드',
  })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
