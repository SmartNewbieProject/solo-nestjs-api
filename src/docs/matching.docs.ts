import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@/types/enum';

export class MatchingUserResponse {
  @ApiProperty({
    description: '매칭 대상 사용자 목록',
    type: [String],
    example: ['user-id-1', 'user-id-2']
  })
  list: string[];

  @ApiProperty({
    description: '매칭 대상 사용자 수',
    type: Number,
    example: 2
  })
  count: number;
}

export class UniversityInfo {
  @ApiProperty({
    description: '학과명',
    example: '컴퓨터공학과'
  })
  department: string;

  @ApiProperty({
    description: '대학교명',
    example: '서울대학교'
  })
  name: string;

  @ApiProperty({
    description: '학년',
    example: '3'
  })
  grade: string;

  @ApiProperty({
    description: '학번',
    example: '2020'
  })
  studentNumber: string;
}

export class PreferenceTypeGroup {
  @ApiProperty({
    description: '선호도 타입 이름',
    example: 'PERSONALITY'
  })
  typeName: string;

  @ApiProperty({
    description: '선호도 옵션들',
    type: [String],
    example: ['활발한', '차분한']
  })
  options: string[];
}

export class PartnerResponse {
  @ApiProperty({
    description: '매칭된 파트너 정보',
    type: 'object',
    nullable: true,
    properties: {
      id: {
        type: 'string',
        description: '파트너 ID',
        example: 'partner-id-1'
      },
      name: {
        type: 'string',
        description: '파트너 이름',
        example: '홍길동'
      },
      age: {
        type: 'number',
        description: '파트너 나이',
        example: 25
      },
      gender: {
        type: 'string',
        enum: Object.values(Gender),
        description: '파트너 성별',
        example: Gender.MALE
      },
      university: {
        type: UniversityInfo,
        description: '대학교 정보',
        nullable: true
      },
      preferences: {
        type: [PreferenceTypeGroup],
        description: '선호도 정보 목록',
        example: [
          {
            typeName: 'PERSONALITY',
            options: ['활발한', '차분한']
          },
          {
            typeName: 'INTEREST',
            options: ['영화', '음악', '여행']
          }
        ]
      }
    }
  })
  partner: {
    id: string;
    name: string;
    age: number;
    gender: Gender;
    university: {
      department: string;
      name: string;
      grade: string;
      studentNumber: string;
    } | null;
    preferences: PreferenceTypeGroup[];
  } | null;
} 