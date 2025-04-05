import { ApiProperty } from '@nestjs/swagger';

/**
 * 프로필 이미지 응답 DTO
 */
export class ProfileImageDto {
  @ApiProperty({
    description: '프로필 이미지 ID',
    example: '01HFGXS6YWVXDKB8RZT2VMBCHM'
  })
  id: string;

  @ApiProperty({
    description: '이미지 순서',
    example: 1
  })
  order: number;

  @ApiProperty({
    description: '대표 이미지 여부',
    example: true
  })
  isMain: boolean;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://example.com/images/profile.jpg'
  })
  url: string;
}

/**
 * 대학 정보 응답 DTO
 */
export class UniversityDetailDto {
  @ApiProperty({
    description: '대학교 이름',
    example: '한밭대학교'
  })
  name: string;

  @ApiProperty({
    description: '인증 여부',
    example: true
  })
  authentication: boolean;

  @ApiProperty({
    description: '학과',
    example: '컴퓨터공학과'
  })
  department: string;
}

/**
 * 선호도 옵션 응답 DTO
 */
export class PreferenceOptionDto {
  @ApiProperty({
    description: '선호도 옵션 ID',
    example: '01HFGXS6YW1111111111AAAAA'
  })
  id: string;

  @ApiProperty({
    description: '선호도 옵션 표시 이름',
    example: '활발함'
  })
  displayName: string;
}

/**
 * 선호도 타입 그룹 응답 DTO
 */
export class PreferenceTypeGroupDto {
  @ApiProperty({
    description: '선호도 타입 이름',
    example: '성격'
  })
  typeName: string;

  @ApiProperty({
    description: '선택된 옵션 목록',
    type: [PreferenceOptionDto]
  })
  selectedOptions: PreferenceOptionDto[];
}

/**
 * 프로필 응답 DTO
 */
export class ProfileResponseDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동'
  })
  name: string;

  @ApiProperty({
    description: '나이',
    example: 28
  })
  age: number;

  @ApiProperty({
    description: '성별',
    example: 'MALE',
    enum: ['MALE', 'FEMALE']
  })
  gender: string;

  @ApiProperty({
    description: '프로필 이미지 목록',
    type: [ProfileImageDto]
  })
  profileImages: ProfileImageDto[];

  @ApiProperty({
    description: '대학 정보',
    type: UniversityDetailDto,
    nullable: true
  })
  universityDetails: UniversityDetailDto | null;

  @ApiProperty({
    description: '선호도 정보',
    type: [PreferenceTypeGroupDto]
  })
  preferences: PreferenceTypeGroupDto[];
}

/**
 * 인증 실패 응답 DTO
 */
export class UnauthorizedResponseDto {
  @ApiProperty({
    description: '오류 메시지',
    example: 'Unauthorized'
  })
  error: string;
}

/**
 * 프로필 찾을 수 없음 응답 DTO
 */
export class NotFoundResponseDto {
  @ApiProperty({
    description: '오류 메시지',
    example: '사용자 프로필을 찾을 수 없습니다.'
  })
  error: string;
}
