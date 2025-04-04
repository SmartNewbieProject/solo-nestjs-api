import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: '비밀번호 (최소 8자, 문자와 숫자 포함)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 최소 8자 이상이며, 문자와 숫자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @MaxLength(15, { message: '이름은 최대 15자까지 입력 가능합니다.' })
  name: string;

  @ApiProperty({
    example: 25,
    description: '사용자 나이',
  })
  @IsNumber({}, { message: '나이는 숫자로 입력해주세요.' })
  @IsNotEmpty({ message: '나이는 필수 입력 항목입니다.' })
  age: number;

  @ApiProperty({
    example: 'MALE',
    description: '성별 (MALE 또는 FEMALE)',
    enum: ['MALE', 'FEMALE'],
  })
  @IsString()
  @IsNotEmpty({ message: '성별은 필수 입력 항목입니다.' })
  @Matches(/^(MALE|FEMALE)$/, { message: '성별은 MALE 또는 FEMALE이어야 합니다.' })
  gender: 'MALE' | 'FEMALE';
}
