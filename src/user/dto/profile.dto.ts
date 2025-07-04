import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PreferenceData {
  @ApiProperty({
    example: '문신 선호도',
    description: '옵션 타입의 이름',
  })
  @IsString()
  @IsNotEmpty()
  typeName: string;

  @ApiProperty({
    example: [
      'ed4a1fa2-8f26-4862-8567-878a069ee524',
      'ed4a1fa2-8f26-4862-8567-878a069ee526',
    ],
    description: '옵션 ID 리스트',
  })
  @IsArray()
  @IsString({ each: true })
  optionIds: string[];
}

export class PreferenceSave {
  @ApiProperty({
    description: '사용자 선호도 데이터 배열',
    example: [
      {
        typeName: '문신 선호도',
        optionIds: ['1fc730ec-ceed-4820-a55e-2bbec6bf3a80'],
      },
      {
        typeName: '음주 선호도',
        optionIds: ['a0291d73-cdeb-4ba3-9b5a-f6e6c573c54c'],
      },
      {
        typeName: '성격 유형',
        optionIds: [
          '8dc5e263-e4b1-4975-8ec9-faf905a8dd7e',
          '700c83fa-b614-483b-9556-750b7d70d3a1',
          '1d9cad0b-9065-4ee8-8c15-b24527f64407',
        ],
      },
    ],
    type: [PreferenceData],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceData)
  data: PreferenceData[];
}

export default class ProfileDto {
  static PreferenceSave = PreferenceSave;
}

export class InstagramId {
  @ApiProperty({
    example: '@.somqai3',
    description: '인스타그램 ID',
  })
  @IsString()
  @IsNotEmpty()
  instagramId: string;
}

export class MbtiUpdate {
  @ApiProperty({
    example: 'INFP',
    description: 'MBTI',
  })
  @IsString()
  @IsNotEmpty()
  mbti: string;
}

export class MbtiPreferencesRequest {
  @ApiProperty({
    example: 'INFP',
    description: '선호하는 MBTI',
  })
  @IsString()
  @IsNotEmpty()
  goodMbti: string;

  @ApiProperty({
    example: 'INFP',
    description: '싫어하는 MBTI',
  })
  @IsString()
  @IsNotEmpty()
  badMbti: string;
}

export class SelfPreferencesSave {
  @ApiProperty({
    description: 'MBTI 선호도 데이터',
    example: {
      goodMbti: 'INFP',
      badMbti: 'ESTJ',
    },
    type: MbtiPreferencesRequest,
  })
  @ValidateNested({ each: true })
  @Type(() => MbtiPreferencesRequest)
  additional: MbtiPreferencesRequest;

  @ApiProperty({
    description: '사용자 성향 선호도 데이터 배열',
    example: [
      {
        typeName: '선호 나이대',
        optionIds: ['977daf95-b50e-4894-aea9-c6e64c78a90d'],
      },
      {
        typeName: '연애 스타일',
        optionIds: [
          '44f4e49f-3060-41d7-a0ce-331258c06324',
          '6b128c16-1e9b-4256-8bf7-27f68c7cf0c1',
          '9f6610b4-cd3b-41de-8cc0-06c7e7afa204',
        ],
      },
      {
        typeName: '음주 선호도',
        optionIds: ['080e5185-5bd8-47e9-9ce2-eb9ff64fe178'],
      },
      {
        typeName: '관심사',
        optionIds: [
          '394e7fcc-5141-4603-8d48-6ba8efe42e0a',
          'c84070de-4194-492a-84d3-18071e7f9e14',
          'bd962b7b-b37d-4833-aed5-a73588c307f8',
          '45f82a3a-621a-44c0-85e8-7fb5b34eaaf6',
          '9f0fb1cd-d364-433a-a371-5d985979255f',
        ],
      },
      {
        typeName: '라이프스타일',
        optionIds: [
          '56a3cfcc-3045-469c-ae98-7b1c62ad8df6',
          'ad1ac46f-d8e8-45f2-ac0a-e1bb63141137',
          '457e936f-c451-433a-9dd4-20638c7db55d',
        ],
      },
      {
        typeName: 'MBTI 유형',
        optionIds: ['2cd83de2-290a-4bcd-94d9-aaac1055d030'],
      },
      {
        typeName: '군필 여부',
        optionIds: ['01HNGW1234567890ABCDEF001'],
      },
      {
        typeName: '성격 유형',
        optionIds: ['13a5b677-2cca-4776-91ed-aac8c08e0045'],
      },
      {
        typeName: '흡연 선호도',
        optionIds: ['dce1747a-f347-4812-8220-b931aceb2ded'],
      },
      {
        typeName: '문신 선호도',
        optionIds: ['21fd9662-c281-4294-a800-a7a0252fe637'],
      },
    ],
    type: [PreferenceData],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => PreferenceData)
  preferences: PreferenceData[];
}
