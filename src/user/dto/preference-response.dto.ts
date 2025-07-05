import { ApiProperty } from '@nestjs/swagger';

/**
 * 선호도 옵션 DTO
 */
export class PreferenceOptionDto {
  @ApiProperty({
    description: '선호도 옵션 ID',
    example: '01HFGXS6YW1111111111AAAAA',
  })
  id: string;

  @ApiProperty({
    description: '선호도 옵션 표시 이름',
    example: '활발함',
  })
  displayName: string;
}

/**
 * 선호도 타입 DTO
 */
export class PreferenceTypeDto {
  @ApiProperty({
    description: '선호도 타입 이름',
    example: '성격',
  })
  typeName: string;

  @ApiProperty({
    description: '선호도 옵션 목록',
    type: [PreferenceOptionDto],
  })
  options: PreferenceOptionDto[];

  @ApiProperty({
    description: '다중 선택 가능 여부',
    example: true,
  })
  multiple: boolean;

  @ApiProperty({
    description: '최대 선택 가능 개수',
    example: 3,
  })
  maximumChoiceCount: number;
}

/**
 * 선호도 저장 요청 항목 DTO
 */
export class PreferenceSaveItemDto {
  @ApiProperty({
    description: '선호도 타입 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  preferenceTypeId: string;

  @ApiProperty({
    description: '선택한 선호도 옵션 ID 목록',
    example: ['01HFGXS6YW1111111111AAAAA', '01HFGXS6YW2222222222BBBBB'],
    type: [String],
  })
  preferenceOptionIds: string[];
}

/**
 * 선호도 저장 요청 DTO
 */
export class PreferenceSaveRequestDto {
  @ApiProperty({
    description: '선호도 저장 데이터',
    type: [PreferenceSaveItemDto],
  })
  data: PreferenceSaveItemDto[];
}

/**
 * 선호도 저장 응답 DTO
 */
export class PreferenceSaveResponseDto {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '선호도가 성공적으로 저장되었습니다.',
  })
  message: string;
}

/**
 * 잘못된 요청 응답 DTO
 */
export class BadRequestResponseDto {
  @ApiProperty({
    description: '상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '오류 메시지 목록',
    example: ['data must be an array'],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: '오류 유형',
    example: 'Bad Request',
  })
  error: string;
}
