import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { eq, and, isNull } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';
import { profiles } from '@database/schema';
import { withdrawalReasons } from '@database/schema/withdrawal_reasons';
import { WithdrawalReason } from '@/types/withdrawal';
import { generateUuidV7 } from '@/database/schema/helper';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async findUserByEmail(email: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.phoneNumber, phoneNumber), isNull(users.deletedAt)))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findGenderByUserId(userId: string) {
    const result = await this.db.select({
      gender: profiles.gender
    })
      .from(schema.profiles)
      .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async findUserById(id: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    console.log(`리프레시 토큰 저장 - userId: ${userId}, 토큰 길이: ${refreshToken?.length}`);

    const result = await this.db.update(users)
      .set({ refreshToken })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));

    console.log(`리프레시 토큰 저장 결과:`, result);

    // 저장 후 확인
    const updatedUser = await this.findUserById(userId);
    console.log(`저장 후 토큰 길이 확인: ${updatedUser?.refreshToken?.length}`);
  }

  async findRefreshToken(userId: string, refreshToken: string) {
    console.log(`리프레시 토큰 검색 - userId: ${userId}, 토큰 길이: ${refreshToken?.length}`);
    console.log(`입력된 토큰 처음 10자: ${refreshToken?.substring(0, 10)}`);
    console.log(`입력된 토큰 마지막 10자: ${refreshToken?.substring(refreshToken.length - 10)}`);

    // 먼저 사용자 정보만 검색
    const userOnly = await this.db.select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    if (userOnly.length > 0) {
      const storedToken = userOnly[0].refreshToken;

      if (storedToken) {
        console.log(`사용자 발견 - 저장된 토큰 길이: ${storedToken.length}`);
        console.log(`저장된 토큰 처음 10자: ${storedToken.substring(0, 10)}`);
        console.log(`저장된 토큰 마지막 10자: ${storedToken.substring(storedToken.length - 10)}`);

        // 저장된 토큰과 입력된 토큰이 동일한지 비교
        if (storedToken === refreshToken) {
          console.log('토큰 정확히 일치');
        } else {
          console.log('토큰 불일치');

          // 이상한 문자 제거 후 비교
          const cleanInputToken = refreshToken.replace(/[\s\n\r\t]/g, '');
          const cleanStoredToken = storedToken.replace(/[\s\n\r\t]/g, '');

          if (cleanStoredToken === cleanInputToken) {
            console.log('이상한 문자 제거 후 토큰 일치');
            // 이상한 문자가 제거된 토큰으로 저장된 토큰 업데이트
            await this.db.update(users)
              .set({ refreshToken: cleanStoredToken })
              .where(eq(users.id, userId));
            console.log('저장된 토큰 업데이트 완료');
          } else {
            console.log('이상한 문자 제거 후에도 토큰 불일치');
          }
        }
      } else {
        console.log('저장된 토큰이 없습니다.');
      }
    } else {
      console.log('사용자를 찾을 수 없음');
    }

    // 사용자와 토큰 모두 일치하는지 검색
    const result = await this.db.select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    console.log(`리프레시 토큰 검색 결과: ${result.length > 0 ? '성공' : '실패'}`);

    // 이상한 문자가 있는 경우 정제된 토큰으로 다시 시도
    if (result.length === 0) {
      const cleanToken = refreshToken.replace(/[\s\n\r\t]/g, '');
      if (cleanToken !== refreshToken) {
        console.log(`정제된 토큰으로 다시 시도 - 길이: ${cleanToken.length}`);

        const cleanResult = await this.db.select()
          .from(users)
          .where(
            and(
              eq(users.id, userId),
              eq(users.refreshToken, cleanToken),
              isNull(users.deletedAt)
            )
          )
          .limit(1);

        console.log(`정제된 토큰 검색 결과: ${cleanResult.length > 0 ? '성공' : '실패'}`);
        return cleanResult.length > 0 ? cleanResult[0] : null;
      }
    }

    return result.length > 0 ? result[0] : null;
  }
  async updateRefreshToken(userId: string, oldToken: string, newToken: string) {
    console.log(`리프레시 토큰 업데이트 - userId: ${userId}`);
    console.log(`이전 토큰 길이: ${oldToken?.length}, 새 토큰 길이: ${newToken?.length}`);

    const result = await this.db.update(users)
      .set({ refreshToken: newToken })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, oldToken),
          isNull(users.deletedAt)
        )
      );

    console.log(`리프레시 토큰 업데이트 결과:`, result);

    // 업데이트 후 확인
    const updatedUser = await this.findUserById(userId);
    console.log(`업데이트 후 토큰 길이 확인: ${updatedUser?.refreshToken?.length}`);
  }

  async removeRefreshToken(userId: string, refreshToken: string) {
    console.log(`리프레시 토큰 삭제 - userId: ${userId}, 토큰 길이: ${refreshToken?.length}`);

    const result = await this.db.update(users)
      .set({ refreshToken: null })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken),
          isNull(users.deletedAt)
        )
      );

    console.log(`리프레시 토큰 삭제 결과:`, result);
  }

  /**
   * 사용자를 탈퇴 처리하고 탈퇴 사유를 저장합니다.
   * @param userId 사용자 ID
   * @param reason 탈퇴 사유
   * @param detail 상세 사유 (선택 사항)
   */
  async deleteUser(userId: string, reason: WithdrawalReason, detail?: string) {
    return await this.db.transaction(async (tx) => {
      // 사용자 정보 조회
      const user = await tx.query.users.findFirst({
        where: and(eq(users.id, userId), isNull(users.deletedAt)),
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 서비스 사용 기간 계산 (일 단위)
      const now = new Date();
      const createdAt = new Date(user.createdAt);
      const serviceDurationDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // 탈퇴 사유 저장
      await tx.insert(withdrawalReasons).values({
        id: generateUuidV7(),
        userId,
        reason,
      });

      // 사용자 탈퇴 처리
      await tx.update(users)
        .set({ deletedAt: now })
        .where(eq(users.id, userId));

      return { userId, withdrawnAt: now, serviceDurationDays };
    });
  }
}
