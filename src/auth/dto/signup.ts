import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength, IsOptional, ValidateNested, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '@/types/enum';
import * as multer from 'multer';

export class SignupRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '비밀번호 (최소 8자, 문자와 숫자, 특수문자 포함)',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W_]{8,}$/, {
    message: '비밀번호는 최소 8자 이상이며, 문자와 숫자, 특수문자를 포함해야 합니다.',
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
    example: '2000-06-27',
    description: '생년월일',
  })
  @IsString()
  @IsNotEmpty({ message: '생년월일은 필수 입력 항목입니다.' })
  birthday: string;

  @IsString()
  @Matches(/^010-?\d{3,4}-?\d{4}$/, {
    message: '유효한 전화번호 형식이 아닙니다.',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 20,
    description: '나이',
  })
  @IsNumber()
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
  @Transform(({ value }) => value === 'MALE' ? Gender.MALE : Gender.FEMALE)
  gender: Gender;

  @ApiProperty({
    example: 'ENFJ',
    description: 'MBTI',
  })
  @IsString()
  @IsOptional()
  mbti?: string;

  @ApiProperty({
    example: '서울대학교',
    description: '대학교 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '대학교 이름은 필수 입력 항목입니다.' })
  universityName: string;

  @ApiProperty({
    example: '컴퓨터공학과',
    description: '학과명',
  })
  @IsString()
  @IsNotEmpty({ message: '학과명은 필수 입력 항목입니다.' })
  departmentName: string;

  @ApiProperty({
    example: '3학년',
    description: '학년',
  })
  @IsString()
  @IsNotEmpty({ message: '학년은 필수 입력 항목입니다.' })
  grade: string;

  @ApiProperty({
    example: '19학번',
    description: '학번',
  })
  @IsString()
  @IsNotEmpty({ message: '학번은 필수 입력 항목입니다.' })
  studentNumber: string;

  @ApiProperty({
    example: 'instagram_id',
    description: '인스타그램 ID',
  })
  @IsString()
  @IsOptional()
  instagramId?: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: '프로필 이미지 파일들 (3개, jpg/jpeg/png 형식, 각 20MB 이하)',
    maxItems: 3,
  })
  @IsOptional()
  profileImages: multer.File[];
}

export class SmsCodeCreation {
  @IsString()
  @Matches(/^010-?\d{3,4}-?\d{4}$/, {
    message: '유효한 전화번호 형식이 아닙니다.',
  })
  phoneNumber: string;
}

export class AuthorizeSmsCode {
  @IsString()
  uniqueKey: string;

  @IsString()
  authorizationCode: string;
}
