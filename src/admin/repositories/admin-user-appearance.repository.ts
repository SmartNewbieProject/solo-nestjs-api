import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users, profiles, universityDetails, profileImages, images } from '@/database/schema';
import { and, count, desc, eq, gte, ilike, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { AdminUserAppearanceListRequest, AppearanceGrade, UserAppearanceGradeStatsResponse, UserProfileWithAppearance } from '../dto/user-appearance.dto';
import { PaginatedResponse } from '@/types/pagination';

@Injectable()
export class AdminUserAppearanceRepository {
  private readonly logger = new Logger(AdminUserAppearanceRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 외모 등급 필드가 없는 경우 마이그레이션을 위한 임시 함수
   * 실제 프로덕션에서는 마이그레이션 스크립트를 통해 처리해야 함
   */
  async ensureAppearanceGradeField(): Promise<void> {
    try {
      // 마이그레이션 파일이 생성되었으므로 이 메서드는 더 이상 필요하지 않습니다.
      // 하지만 호환성을 위해 유지합니다.
      this.logger.log('외모 등급 필드가 이미 스키마에 정의되어 있습니다.');
    } catch (error) {
      this.logger.error(`외모 등급 필드 확인 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 목록을 필터링하여 조회합니다.
   */
  async getUsersWithAppearanceGrade(
    params: AdminUserAppearanceListRequest
  ): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    try {
      await this.ensureAppearanceGradeField();

      const { page = 1, limit = 10, gender, appearanceGrade, universityName, minAge, maxAge, searchTerm } = params;
      const offset = (page - 1) * limit;

      // 기본 조건: 삭제되지 않은 사용자
      let conditions = and(isNull(users.deletedAt));

      // 성별 필터
      if (gender) {
        conditions = and(conditions, eq(profiles.gender, gender));
      }

      // 외모 등급 필터
      if (appearanceGrade) {
        conditions = and(conditions, sql`${profiles.appearanceGrade} = ${appearanceGrade}`);
      }

      // 나이 범위 필터
      if (minAge) {
        conditions = and(conditions, gte(profiles.age, minAge));
      }

      if (maxAge) {
        conditions = and(conditions, lte(profiles.age, maxAge));
      }

      // 대학교 이름 필터
      if (universityName) {
        conditions = and(conditions, ilike(universityDetails.universityName, `%${universityName}%`));
      }

      // 검색어 필터 (이름, 이메일, 전화번호)
      if (searchTerm) {
        conditions = and(
          conditions,
          or(
            ilike(users.name, `%${searchTerm}%`),
            ilike(users.email, `%${searchTerm}%`),
            ilike(users.phoneNumber, `%${searchTerm}%`)
          )
        );
      }

      // 총 항목 수 조회
      const totalItemsResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(universityDetails, eq(profiles.universityDetailId, universityDetails.id))
        .where(conditions);

      const totalItems = totalItemsResult[0].count;
      const totalPages = Math.ceil(totalItems / limit);

      // 사용자 목록 조회
      const usersData = await this.drizzleService.db
        .select({
          id: users.id,
          name: users.name,
          age: profiles.age,
          gender: profiles.gender,
          appearanceGrade: profiles.appearanceGrade,
          university: universityDetails.universityName,
          department: universityDetails.department,
          createdAt: users.createdAt,
          // 최근 접속일은 별도 테이블에서 조회해야 할 수 있음
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(universityDetails, eq(profiles.universityDetailId, universityDetails.id))
        .where(conditions)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));

      // 프로필 이미지 URL 조회
      const userIds = usersData.map(user => user.id);
      const profileImagesData = await this.drizzleService.db
        .select({
          userId: profiles.userId,
          imageUrl: images.s3Url,
          isMain: profileImages.isMain,
        })
        .from(profiles)
        .leftJoin(profileImages, eq(profiles.id, profileImages.profileId))
        .leftJoin(images, eq(profileImages.imageId, images.id))
        .where(and(
          inArray(profiles.userId, userIds),
          eq(profileImages.isMain, true)
        ));

      // 이미지 URL 매핑
      const imageUrlMap = new Map<string, string>();
      profileImagesData.forEach(item => {
        if (item.imageUrl && item.isMain) {
          imageUrlMap.set(item.userId, item.imageUrl);
        }
      });

      // 결과 매핑
      const items = usersData.map(user => ({
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        profileImageUrl: imageUrlMap.get(user.id) || null,
        university: user.university ? `${user.university} ${user.department || ''}` : null,
        appearanceGrade: user.appearanceGrade || AppearanceGrade.UNCLASSIFIED,
        createdAt: user.createdAt,
        lastActiveAt: null, // 최근 접속일은 별도 로직으로 구현 필요
      }));

      return {
        items,
        meta: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(`사용자 목록 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자의 외모 등급을 설정합니다.
   */
  async setUserAppearanceGrade(userId: string, grade: AppearanceGrade): Promise<boolean> {
    try {
      await this.ensureAppearanceGradeField();

      // 사용자 프로필 조회
      const userProfile = await this.drizzleService.db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, userId));

      if (userProfile.length === 0) {
        return false;
      }

      // 외모 등급 업데이트
      await this.drizzleService.db
        .update(profiles)
        .set({ appearanceGrade: grade })
        .where(eq(profiles.userId, userId));

      return true;
    } catch (error) {
      this.logger.error(`사용자 외모 등급 설정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 여러 사용자의 외모 등급을 일괄 설정합니다.
   */
  async bulkSetUserAppearanceGrade(userIds: string[], grade: AppearanceGrade): Promise<number> {
    try {
      await this.ensureAppearanceGradeField();

      // 존재하는 사용자 프로필 ID 조회
      const userProfiles = await this.drizzleService.db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(inArray(profiles.userId, userIds));

      const validUserIds = userProfiles.map(profile => profile.userId);

      if (validUserIds.length === 0) {
        return 0;
      }

      // 외모 등급 일괄 업데이트
      await this.drizzleService.db
        .update(profiles)
        .set({ appearanceGrade: grade })
        .where(inArray(profiles.userId, validUserIds));

      return validUserIds.length;
    } catch (error) {
      this.logger.error(`사용자 외모 등급 일괄 설정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 외모 등급별 사용자 수 통계를 조회합니다.
   */
  async getAppearanceGradeStats(): Promise<UserAppearanceGradeStatsResponse> {
    try {
      await this.ensureAppearanceGradeField();

      // 각 등급별 사용자 수 조회
      const statsQuery = sql`
        SELECT
          COALESCE(appearance_grade, 'UNCLASSIFIED') as grade,
          COUNT(*) as count
        FROM profiles
        WHERE profiles.deleted_at IS NULL
        GROUP BY appearance_grade
      `;

      const statsResult = await this.drizzleService.db.execute(statsQuery);

      // 결과 매핑
      const stats: UserAppearanceGradeStatsResponse = {
        S: 0,
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        UNCLASSIFIED: 0,
        total: 0,
      };

      // statsResult가 배열이 아닐 수 있으므로 안전하게 처리
      const rows = Array.isArray(statsResult) ? statsResult : statsResult.rows || [];

      rows.forEach(row => {
        const grade = row.grade as AppearanceGrade;
        const count = parseInt(row.count as string, 10);

        if (grade in stats) {
          stats[grade] = count;
        } else {
          stats.UNCLASSIFIED += count;
        }

        stats.total += count;
      });

      return stats;
    } catch (error) {
      this.logger.error(`외모 등급 통계 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 미분류 사용자 목록을 조회합니다.
   */
  async getUnclassifiedUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    try {
      await this.ensureAppearanceGradeField();

      const offset = (page - 1) * limit;

      // 미분류 사용자 수 조회
      const totalItemsResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(and(
          isNull(users.deletedAt),
          or(
            eq(profiles.appearanceGrade, AppearanceGrade.UNCLASSIFIED),
            isNull(profiles.appearanceGrade)
          )
        ));

      const totalItems = totalItemsResult[0].count;
      const totalPages = Math.ceil(totalItems / limit);

      // 미분류 사용자 목록 조회
      const usersData = await this.drizzleService.db
        .select({
          id: users.id,
          name: users.name,
          age: profiles.age,
          gender: profiles.gender,
          university: universityDetails.universityName,
          department: universityDetails.department,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(universityDetails, eq(profiles.universityDetailId, universityDetails.id))
        .where(and(
          isNull(users.deletedAt),
          or(
            eq(profiles.appearanceGrade, AppearanceGrade.UNCLASSIFIED),
            isNull(profiles.appearanceGrade)
          )
        ))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));

      // 프로필 이미지 URL 조회
      const userIds = usersData.map(user => user.id);
      const profileImagesData = await this.drizzleService.db
        .select({
          userId: profiles.userId,
          imageUrl: images.s3Url,
          isMain: profileImages.isMain,
        })
        .from(profiles)
        .leftJoin(profileImages, eq(profiles.id, profileImages.profileId))
        .leftJoin(images, eq(profileImages.imageId, images.id))
        .where(and(
          inArray(profiles.userId, userIds),
          eq(profileImages.isMain, true)
        ));

      // 이미지 URL 매핑
      const imageUrlMap = new Map<string, string>();
      profileImagesData.forEach(item => {
        if (item.imageUrl && item.isMain) {
          imageUrlMap.set(item.userId, item.imageUrl);
        }
      });

      // 결과 매핑
      const items = usersData.map(user => ({
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        profileImageUrl: imageUrlMap.get(user.id) || null,
        university: user.university ? `${user.university} ${user.department || ''}` : null,
        appearanceGrade: AppearanceGrade.UNCLASSIFIED,
        createdAt: user.createdAt,
        lastActiveAt: null,
      }));

      return {
        items,
        meta: {
          totalItems,
          itemCount: items.length,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(`미분류 사용자 목록 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }
}
