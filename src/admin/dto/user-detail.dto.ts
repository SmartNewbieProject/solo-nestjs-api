import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Gender } from '@/types/enum';
import { ProfileImage, UniversityDetail, PreferenceTypeGroup } from '@/types/user';

/**
 * 계정 상태 enum
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * 유저 상세 정보 응답 DTO
 */
export class UserDetailResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  id: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '나이',
    example: 28,
  })
  age: number;

  @ApiProperty({
    description: '성별',
    enum: Gender,
    example: Gender.MALE,
  })
  gender: Gender;

  @ApiProperty({
    description: '계정 상태',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @ApiProperty({
    description: '프로필 이미지 목록',
    type: [Object],
    example: [
      {
        id: '01HFGXS6YWVXDKB8RZT2VMBCHM',
        order: 1,
        isMain: true,
        url: 'https://example.com/images/profile.jpg'
      }
    ],
  })
  profileImages: ProfileImage[];

  @ApiProperty({
    description: '인스타그램 ID',
    example: 'instagram_user',
    nullable: true,
  })
  instagramId: string | null;

  @ApiProperty({
    description: '대학교 정보',
    type: Object,
    example: {
      name: '한밭대학교',
      authentication: true,
      department: '컴퓨터공학과',
      grade: '3학년',
      studentNumber: '20201234'
    },
    nullable: true,
  })
  universityDetails: UniversityDetail | null;

  @ApiProperty({
    description: '선호도 정보',
    type: [Object],
    example: [
      {
        typeName: '성격',
        selectedOptions: [
          {
            id: '01HFGXS6YW1111111111AAAAA',
            displayName: '활발함'
          }
        ]
      }
    ],
  })
  preferences: PreferenceTypeGroup[];

  @ApiProperty({
    description: '가입일',
    example: '2025-04-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '최근 접속일',
    example: '2025-04-22T15:30:00Z',
    nullable: true,
  })
  lastActiveAt: Date | null;

  @ApiProperty({
    description: '역할 (사용자/관리자)',
    example: 'user',
    enum: ['user', 'admin'],
  })
  role: string;

  @ApiProperty({
    description: '프로필 소개 제목',
    example: '안녕하세요, 반갑습니다!',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    description: '프로필 소개 내용',
    example: '저는 컴퓨터공학을 전공하고 있는 대학생입니다. 취미는 독서와 여행입니다.',
    nullable: true,
  })
  introduction: string | null;

  @ApiProperty({
    description: '외모 등급',
    example: 'A',
    enum: ['S', 'A', 'B', 'C', 'UNKNOWN'],
    nullable: true,
  })
  appearanceRank: string | null;

  @ApiProperty({
    description: 'OAuth 제공자',
    example: 'google',
    nullable: true,
  })
  oauthProvider: string | null;

  @ApiProperty({
    description: '계정 삭제일',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}

/**
 * 계정 상태 변경 요청 DTO
 */
export class UpdateAccountStatusRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '계정 상태',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;

  @ApiProperty({
    description: '상태 변경 사유',
    example: '불건전한 활동으로 인한 계정 정지',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * 경고 메시지 발송 요청 DTO
 */
export class SendWarningMessageRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '경고 메시지 제목',
    example: '서비스 이용 규정 위반 안내',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '경고 메시지 내용',
    example: '귀하의 계정에서 서비스 이용 규정을 위반하는 활동이 감지되었습니다. 자세한 내용은 본문을 참고해주세요.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * 강제 로그아웃 요청 DTO
 */
export class ForceLogoutRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '강제 로그아웃 사유',
    example: '보안상의 이유로 강제 로그아웃 처리되었습니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * 프로필 수정 요청 발송 DTO
 */
export class SendProfileUpdateRequestRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '수정 요청 제목',
    example: '프로필 정보 수정 요청',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '수정 요청 내용',
    example: '귀하의 프로필 정보 중 일부가 부적절하여 수정이 필요합니다. 자세한 내용은 본문을 참고해주세요.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * 유저 프로필 직접 수정 요청 DTO
 */
export class UpdateUserProfileRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '인스타그램 ID',
    example: 'instagram_user',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  instagramId?: string | null;

  @ApiProperty({
    description: '수정 사유',
    example: '부적절한 내용 수정',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * 기본 응답 DTO
 */
export class BasicResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;
}
