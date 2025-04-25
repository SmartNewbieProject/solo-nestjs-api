import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import * as schema from '@/database/schema';
import { users, profiles, universityDetails, profileImages, images } from '@/database/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { AccountStatus } from '../dto/user-detail.dto';
import { generateUuidV7 } from '@/database/schema/helper';

@Injectable()
export class AdminUserDetailRepository {
  private readonly logger = new Logger(AdminUserDetailRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 사용자 상세 정보를 조회합니다.
   */
  async getUserDetail(userId: string) {
    try {
      // 사용자 기본 정보 조회
      const userData = await this.drizzleService.db.query.users.findFirst({
        where: and(
          eq(users.id, userId),
          isNull(users.deletedAt)
        ),
        with: {
          profile: {
            with: {
              universityDetail: true,
            },
          },
        },
      });

      if (!userData) {
        return null;
      }

      // 프로필 이미지 조회
      const profileImagesData = await this.drizzleService.db
        .select({
          id: profileImages.id,
          imageUrl: images.s3Url,
          imageOrder: profileImages.imageOrder,
          isMain: profileImages.isMain,
        })
        .from(profileImages)
        .innerJoin(images, eq(profileImages.imageId, images.id))
        .where(and(
          eq(profileImages.profileId, userData.profile?.id || ''),
          isNull(profileImages.deletedAt)
        ));

      // 사용자 선호도 옵션 조회
      const userPreference = await this.drizzleService.db.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId),
      });

      // 선호도 옵션 조회
      const preferenceOptionsData = userPreference ? await this.drizzleService.db
        .select({
          optionId: schema.userPreferenceOptions.preferenceOptionId,
          optionDisplayName: schema.preferenceOptions.displayName,
          typeName: schema.preferenceTypes.name,
        })
        .from(schema.userPreferenceOptions)
        .innerJoin(
          schema.preferenceOptions,
          eq(schema.userPreferenceOptions.preferenceOptionId, schema.preferenceOptions.id)
        )
        .innerJoin(
          schema.preferenceTypes,
          eq(schema.preferenceOptions.preferenceTypeId, schema.preferenceTypes.id)
        )
        .where(eq(schema.userPreferenceOptions.userPreferenceId, userPreference.id))
        : [];

      // 계정 상태 결정 (현재는 삭제 여부만 확인)
      let accountStatus = AccountStatus.ACTIVE;
      if (userData.deletedAt) {
        accountStatus = AccountStatus.INACTIVE;
      }

      // 최근 접속일 조회 (구현 필요)
      const lastActiveAt = null; // 실제 구현 필요

      // 선호도 정보 가공
      const preferenceMap = new Map();
      preferenceOptionsData.forEach(option => {
        const typeName = option.typeName;
        if (!preferenceMap.has(typeName)) {
          preferenceMap.set(typeName, {
            typeName,
            selectedOptions: [],
          });
        }

        preferenceMap.get(typeName).selectedOptions.push({
          id: option.optionId,
          displayName: option.optionDisplayName,
        });
      });

      // 결과 반환
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        age: userData.profile?.age || 0,
        gender: userData.profile?.gender,
        accountStatus,
        profileImages: profileImagesData.map(img => ({
          id: img.id,
          order: img.imageOrder,
          isMain: img.isMain,
          url: img.imageUrl,
        })),
        instagramId: userData.profile?.instagramId || null,
        universityDetails: userData.profile?.universityDetail ? {
          name: userData.profile.universityDetail.universityName,
          authentication: userData.profile.universityDetail.authentication,
          department: userData.profile.universityDetail.department,
          grade: userData.profile.universityDetail.grade,
          studentNumber: userData.profile.universityDetail.studentNumber,
        } : null,
        preferences: Array.from(preferenceMap.values()),
        createdAt: userData.createdAt,
        lastActiveAt,
        // 추가 정보
        role: userData.role,
        title: userData.profile?.title || null,
        introduction: userData.profile?.introduction || null,
        appearanceRank: userData.profile?.rank || null,
        oauthProvider: userData.oauthProvider || null,
        deletedAt: userData.deletedAt,
      };
    } catch (error) {
      this.logger.error(`사용자 상세 정보 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 계정 상태를 변경합니다.
   */
  async updateAccountStatus(userId: string, status: AccountStatus, reason?: string): Promise<boolean> {
    try {
      // 사용자 존재 여부 확인
      const user = await this.drizzleService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return false;
      }

      // 계정 상태에 따른 처리
      switch (status) {
        case AccountStatus.ACTIVE:
          // 활성화 상태로 변경
          await this.drizzleService.db
            .update(users)
            .set({
              deletedAt: null,
              // 추가 필드가 있다면 여기에 설정
            })
            .where(eq(users.id, userId));
          break;

        case AccountStatus.INACTIVE:
          // 비활성화 상태로 변경 (소프트 삭제)
          await this.drizzleService.db
            .update(users)
            .set({
              deletedAt: new Date(),
              // 추가 필드가 있다면 여기에 설정
            })
            .where(eq(users.id, userId));
          break;

        case AccountStatus.SUSPENDED:
          // 정지 상태로 변경 (추가 필드 필요)
          await this.drizzleService.db
            .update(users)
            .set({
              // 정지 상태를 나타내는 필드 필요
              // 예: suspendedAt: new Date(),
              // 예: suspendReason: reason,
            })
            .where(eq(users.id, userId));
          break;
      }

      // 상태 변경 이력 기록 (필요시 구현)
      // await this.logStatusChange(userId, status, reason);

      return true;
    } catch (error) {
      this.logger.error(`사용자 계정 상태 변경 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자에게 경고 메시지를 발송합니다.
   */
  async sendWarningMessage(userId: string, title: string, content: string): Promise<boolean> {
    try {
      // 사용자 존재 여부 확인
      const user = await this.drizzleService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return false;
      }

      // 경고 메시지 발송 로직 (알림 테이블이 있다면 활용)
      // 예시: 알림 테이블에 경고 메시지 저장
      // await this.drizzleService.db.insert(notifications).values({
      //   id: generateUuidV7(),
      //   userId,
      //   title,
      //   content,
      //   type: 'WARNING',
      //   isRead: false,
      //   createdAt: new Date(),
      // });

      // 이메일 발송 로직 (필요시 구현)
      // await this.sendEmail(user.email, title, content);

      return true;
    } catch (error) {
      this.logger.error(`경고 메시지 발송 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자를 강제 로그아웃 처리합니다.
   */
  async forceLogout(userId: string, reason?: string): Promise<boolean> {
    try {
      // 사용자 존재 여부 확인
      const user = await this.drizzleService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return false;
      }

      // 리프레시 토큰 무효화
      await this.drizzleService.db
        .update(users)
        .set({ refreshToken: null })
        .where(eq(users.id, userId));

      // 강제 로그아웃 이력 기록 (필요시 구현)
      // await this.logForceLogout(userId, reason);

      return true;
    } catch (error) {
      this.logger.error(`강제 로그아웃 처리 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자에게 프로필 수정 요청을 발송합니다.
   */
  async sendProfileUpdateRequest(userId: string, title: string, content: string): Promise<boolean> {
    try {
      // 사용자 존재 여부 확인
      const user = await this.drizzleService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return false;
      }

      // 프로필 수정 요청 발송 로직 (알림 테이블이 있다면 활용)
      // 예시: 알림 테이블에 프로필 수정 요청 저장
      // await this.drizzleService.db.insert(notifications).values({
      //   id: generateUuidV7(),
      //   userId,
      //   title,
      //   content,
      //   type: 'PROFILE_UPDATE_REQUEST',
      //   isRead: false,
      //   createdAt: new Date(),
      // });

      // 이메일 발송 로직 (필요시 구현)
      // await this.sendEmail(user.email, title, content);

      return true;
    } catch (error) {
      this.logger.error(`프로필 수정 요청 발송 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 프로필을 직접 수정합니다.
   */
  async updateUserProfile(userId: string, updateData: { name?: string; instagramId?: string | null }, reason?: string): Promise<boolean> {
    try {
      // 사용자 존재 여부 확인
      const user = await this.drizzleService.db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          profile: true,
        },
      });

      if (!user || !user.profile) {
        return false;
      }

      // 트랜잭션으로 처리
      await this.drizzleService.db.transaction(async (tx) => {
        // 이름 수정
        if (updateData.name !== undefined) {
          await tx
            .update(users)
            .set({ name: updateData.name })
            .where(eq(users.id, userId));

          await tx
            .update(profiles)
            .set({ name: updateData.name })
            .where(eq(profiles.userId, userId));
        }

        // 인스타그램 ID 수정
        if (updateData.instagramId !== undefined) {
          await tx
            .update(profiles)
            .set({ instagramId: updateData.instagramId })
            .where(eq(profiles.userId, userId));
        }

        // 수정 이력 기록 (필요시 구현)
        // await this.logProfileUpdate(tx, userId, updateData, reason);
      });

      return true;
    } catch (error) {
      this.logger.error(`사용자 프로필 수정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }
}
