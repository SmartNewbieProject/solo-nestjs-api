import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@/types/enum';
import { UserRank } from '@/database/schema/profiles';

/**
 * 외모 등급 enum
 */
export enum AppearanceGrade {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 외모 등급을 UserRank로 변환하는 함수
 */
export function appearanceGradeToUserRank(grade: AppearanceGrade): UserRank {
  return grade as unknown as UserRank;
}

/**
 * UserRank를 외모 등급으로 변환하는 함수
 */
export function userRankToAppearanceGrade(rank: UserRank): AppearanceGrade {
  return rank as unknown as AppearanceGrade;
}

/**
 * 유저 목록 조회 요청 DTO (필터링 포함)
 */
export class AdminUserAppearanceListRequest {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: '성별 필터',
    enum: Gender,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: '외모 등급 필터',
    enum: AppearanceGrade,
    required: false,
  })
  @IsEnum(AppearanceGrade)
  @IsOptional()
  appearanceGrade?: AppearanceGrade;

  @ApiProperty({
    description: '대학교 이름 필터',
    example: '서울대학교',
    required: false,
  })
  @IsString()
  @IsOptional()
  universityName?: string;

  @ApiProperty({
    description: '최소 나이 필터',
    example: 20,
    required: false,
  })
  @IsInt()
  @Min(18)
  @IsOptional()
  @Type(() => Number)
  minAge?: number;

  @ApiProperty({
    description: '최대 나이 필터',
    example: 29,
    required: false,
  })
  @IsInt()
  @Min(18)
  @IsOptional()
  @Type(() => Number)
  maxAge?: number;

  @ApiProperty({
    description: '검색어 (이름, 아이디, 전화번호)',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchTerm?: string;
}

/**
 * 유저 외모 등급 설정 요청 DTO
 */
export class SetUserAppearanceGradeRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '외모 등급',
    enum: AppearanceGrade,
    example: AppearanceGrade.A,
    default: AppearanceGrade.UNKNOWN,
  })
  @IsEnum(AppearanceGrade)
  @IsNotEmpty()
  grade: AppearanceGrade = AppearanceGrade.UNKNOWN;
}

/**
 * 일괄 외모 등급 설정 요청 DTO
 */
export class BulkSetUserAppearanceGradeRequest {
  @ApiProperty({
    description: '사용자 ID 목록',
    example: ['01HFGXS6YW1234567890ABCDE', '01HFGXS6YW1234567890ABCDF'],
    type: [String],
  })
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({
    description: '외모 등급',
    enum: AppearanceGrade,
    example: AppearanceGrade.A,
    default: AppearanceGrade.UNKNOWN,
  })
  @IsEnum(AppearanceGrade)
  @IsNotEmpty()
  grade: AppearanceGrade = AppearanceGrade.UNKNOWN;
}

/**
 * 외모 등급 설정 응답 DTO
 */
export class SetUserAppearanceGradeResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: '외모 등급이 성공적으로 설정되었습니다.',
  })
  message: string;
}

/**
 * 등급별 사용자 수 통계 DTO
 */
export class GradeStats {
  @ApiProperty({
    description: 'S등급 사용자 수',
    example: 10,
  })
  S: number;

  @ApiProperty({
    description: 'A등급 사용자 수',
    example: 50,
  })
  A: number;

  @ApiProperty({
    description: 'B등급 사용자 수',
    example: 100,
  })
  B: number;

  @ApiProperty({
    description: 'C등급 사용자 수',
    example: 150,
  })
  C: number;

  @ApiProperty({
    description: '미분류 사용자 수',
    example: 20,
  })
  UNKNOWN: number;

  @ApiProperty({
    description: '전체 사용자 수',
    example: 380,
  })
  total: number;
}

/**
 * 유저 외모 등급 통계 응답 DTO
 */
export class UserAppearanceGradeStatsResponse {
  @ApiProperty({
    description: '전체 등급 분포',
    type: GradeStats,
  })
  all: GradeStats;

  @ApiProperty({
    description: '남성 등급 분포',
    type: GradeStats,
  })
  male: GradeStats;

  @ApiProperty({
    description: '여성 등급 분포',
    type: GradeStats,
  })
  female: GradeStats;
}

/**
 * 유저 프로필 확장 DTO (외모 등급 포함)
 */
export class UserProfileWithAppearance {
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
    description: '나이',
    example: 28,
    nullable: true,
  })
  age: number | null;

  @ApiProperty({
    description: '성별',
    enum: Gender,
    example: Gender.MALE,
    nullable: true,
  })
  gender: Gender | null;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/images/profile.jpg',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiProperty({
    description: '대학교 정보',
    example: '서울대학교 컴퓨터공학과',
    nullable: true,
  })
  university?: string | null;

  @ApiProperty({
    description: '인스타그램 ID',
    example: 'instagram_user',
    nullable: true,
  })
  instagramId?: string | null;

  @ApiProperty({
    description: '인스타그램 프로필 URL',
    example: 'https://www.instagram.com/instagram_user',
    nullable: true,
  })
  instagramUrl?: string | null;

  @ApiProperty({
    description: '외모 등급',
    enum: AppearanceGrade,
    example: AppearanceGrade.A,
    default: AppearanceGrade.UNKNOWN,
  })
  appearanceGrade: AppearanceGrade = AppearanceGrade.UNKNOWN;

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
  lastActiveAt?: Date | null;
}
