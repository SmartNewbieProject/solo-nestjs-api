import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@/types/enum';

export class MatchingUserResponse {
  @ApiProperty({
    description: '매칭 대상 사용자 목록',
    type: [String],
    example: ['user-id-1', 'user-id-2'],
  })
  list: string[];

  @ApiProperty({
    description: '매칭 대상 사용자 수',
    type: Number,
    example: 2,
  })
  count: number;
}

export class UniversityInfo {
  @ApiProperty({
    description: '학과명',
    example: '컴퓨터공학과',
  })
  department: string;

  @ApiProperty({
    description: '대학교명',
    example: '서울대학교',
  })
  name: string;

  @ApiProperty({
    description: '학년',
    example: '3',
  })
  grade: string;

  @ApiProperty({
    description: '학번',
    example: '2020',
  })
  studentNumber: string;
}

export class PreferenceOption {
  @ApiProperty({
    description: '선호도 옵션 ID',
    example: '01HNGW1234567890ABCDEF001',
  })
  id: string;

  @ApiProperty({
    description: '선호도 옵션 표시 이름',
    example: '군필',
  })
  displayName: string;
}

export class PreferenceTypeGroup {
  @ApiProperty({
    description: '선호도 타입 이름',
    example: '군필 여부',
  })
  typeName: string;

  @ApiProperty({
    description: '선택된 선호도 옵션들',
    type: [PreferenceOption],
  })
  selectedOptions: PreferenceOption[];
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
        example: 'd88723de-4658-41d9-8b04-26eded1d26e1',
      },
      name: {
        type: 'string',
        description: '파트너 이름',
        example: '임도아',
      },
      age: {
        type: 'number',
        description: '파트너 나이',
        example: 34,
      },
      gender: {
        type: 'string',
        enum: Object.values(Gender),
        description: '파트너 성별',
        example: Gender.FEMALE,
      },
      university: {
        type: 'object',
        description: '대학교 정보',
        nullable: true,
        properties: {
          department: {
            type: 'string',
            description: '학과명',
          },
          name: {
            type: 'string',
            description: '대학교명',
          },
          grade: {
            type: 'string',
            description: '학년',
          },
          studentNumber: {
            type: 'string',
            description: '학번',
          },
        },
      },
      preferences: {
        type: [PreferenceTypeGroup],
        description: '선호도 정보 목록',
        example: [
          {
            typeName: '군필 여부',
            selectedOptions: [
              {
                id: '01HNGW1234567890ABCDEF001',
                displayName: '군필',
              },
            ],
          },
          {
            typeName: '음주 선호도',
            selectedOptions: [
              {
                id: 'b2f06b1f-8111-467a-a4e9-514897152aa9',
                displayName: '전혀 안 마시는 사람이면 좋겠음',
              },
            ],
          },
          {
            typeName: '관심사',
            selectedOptions: [
              {
                id: 'e0d5555f-35b8-45d1-ba34-8ac103c0535d',
                displayName: '반려동물',
              },
              {
                id: '0a7feaae-48f6-4a16-846d-a99079f4fba8',
                displayName: '카페',
              },
            ],
          },
        ],
      },
    },
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

export class TotalMatchingCountResponse {
  @ApiProperty({
    description: '전체 매칭 수',
    type: Number,
    example: 1234,
    minimum: 0,
  })
  count: number;
}
