import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '@/types/enum';
import * as multer from 'multer';

export class SignupRequest {
  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  name: string;

  @ApiProperty({
    example: '010-1234-1234',
    description: '전화번호',
  })
  @IsString()
  @Matches(/^010-?\d{3,4}-?\d{4}$/, {
    message: '유효한 전화번호 형식이 아닙니다.',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '2001-10-12',
    description: '생년월일',
  })
  @IsString()
  @IsNotEmpty({ message: '생년월일은 필수 입력 항목입니다.' })
  birthday: string;

  @ApiProperty({
    example: 'MALE',
    description: '성별 (MALE 또는 FEMALE)',
    enum: ['MALE', 'FEMALE'],
  })
  @IsString()
  @IsNotEmpty({ message: '성별은 필수 입력 항목입니다.' })
  @Matches(/^(MALE|FEMALE)$/, {
    message: '성별은 MALE 또는 FEMALE이어야 합니다.',
  })
  @Transform(({ value }) => (value === 'MALE' ? Gender.MALE : Gender.FEMALE))
  gender: Gender;

  @ApiProperty({
    example: 23,
    description: '나이',
  })
  @IsNumber()
  @IsNotEmpty({ message: '나이는 필수 입력 항목입니다.' })
  age: number;

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
