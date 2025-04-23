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
  ) {}

  async findUserByEmail(email: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
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
    await this.db.update(users)
      .set({ refreshToken })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
  }

  async findRefreshToken(userId: string, refreshToken: string) {
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

    return result.length > 0 ? result[0] : null;
  }
  async updateRefreshToken(userId: string, oldToken: string, newToken: string) {
    await this.db.update(users)
      .set({ refreshToken: newToken })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, oldToken),
          isNull(users.deletedAt)
        )
      );
  }

  async removeRefreshToken(userId: string, refreshToken: string) {
    await this.db.update(users)
      .set({ refreshToken: null })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken),
          isNull(users.deletedAt)
        )
      );
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
        detail,
        withdrawnAt: now,
        serviceDurationDays,
      });

      // 사용자 탈퇴 처리
      await tx.update(users)
        .set({ deletedAt: now })
        .where(eq(users.id, userId));

      return { userId, withdrawnAt: now, serviceDurationDays };
    });
  }
}
