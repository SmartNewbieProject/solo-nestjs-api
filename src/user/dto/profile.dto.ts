import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class PreferenceData {
  @ApiProperty({
    example: '문신 선호도',
    description: '옵션 타입의 이름'
  })
  @IsString()
  @IsNotEmpty()
  typeName: string;
  
  @ApiProperty({
    example: [
      'ed4a1fa2-8f26-4862-8567-878a069ee524',
      'ed4a1fa2-8f26-4862-8567-878a069ee526',
    ],
    description: '옵션 ID 리스트'
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
        optionIds: [
          '1fc730ec-ceed-4820-a55e-2bbec6bf3a80',
        ]
      },
      {
        typeName: '음주 선호도',
        optionIds: [
          'a0291d73-cdeb-4ba3-9b5a-f6e6c573c54c'
        ]
      },
      {
        typeName: '성격 유형',
        optionIds: [
          '8dc5e263-e4b1-4975-8ec9-faf905a8dd7e',
          '700c83fa-b614-483b-9556-750b7d70d3a1',
          '1d9cad0b-9065-4ee8-8c15-b24527f64407',
        ]
      }
    ],
    type: [PreferenceData]
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
    description: '인스타그램 ID'
  })
  @IsString()
  @IsNotEmpty()
  instagramId: string;
}


export class MbtiUpdate {
  @ApiProperty({
    example: 'INFP',
    description: 'MBTI'
  })
  @IsString()
  @IsNotEmpty()
  mbti: string;
}

export class SelfPreferenceSave {
  @ApiProperty({
    description: '본인 성향 데이터 배열',
    example: [
      {
        typeName: '성격 유형',
        optionIds: [
          '8dc5e263-e4b1-4975-8ec9-faf905a8dd7e',
          '700c83fa-b614-483b-9556-750b7d70d3a1',
        ]
      },
      {
        typeName: '라이프스타일',
        optionIds: [
          '1d9cad0b-9065-4ee8-8c15-b24527f64407',
        ]
      }
    ],
    type: [PreferenceData]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceData)
  data: PreferenceData[];
}