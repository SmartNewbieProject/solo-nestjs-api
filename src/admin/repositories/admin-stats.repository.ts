import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users } from '@/database/schema';
import { count, sql, and, gte, lt } from 'drizzle-orm';

@Injectable()
export class AdminStatsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 총 회원가입자 수를 조회합니다.
   * 삭제되지 않은 사용자만 카운트합니다.
   */
  async getTotalUsersCount(): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    return result[0].count;
  }

  /**
   * 오늘 가입한 회원 수를 조회합니다.
   * 오늘 00:00:00부터 23:59:59까지 생성된 사용자를 카운트합니다.
   */
  async getDailySignupCount(): Promise<number> {
    // 오늘 날짜의 시작(00:00:00)과 끝(23:59:59) 설정
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          gte(users.createdAt, startOfDay),
          lt(users.createdAt, endOfDay)
        )
      );

    return result[0].count;
  }
}
