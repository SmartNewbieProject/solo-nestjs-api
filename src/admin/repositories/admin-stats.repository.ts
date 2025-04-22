import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users } from '@/database/schema';
import { count, sql, and, gte, lt, lte } from 'drizzle-orm';

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

  /**
   * 주간 회원가입자 수를 조회합니다.
   * 이번 주의 월요일 00:00:00부터 일요일 23:59:59까지 생성된 사용자를 카운트합니다.
   */
  async getWeeklySignupCount(): Promise<number> {
    // 이번 주의 월요일과 일요일 가져오기
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

    // 이번 주의 월요일 가져오기 (현재가 월요일이면 오늘, 아니면 지난 월요일)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 일요일이면 -6, 월요일이면 0, 화요일이면 -1, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // 이번 주의 일요일 가져오기 (현재가 일요일이면 오늘, 아니면 다음 일요일)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          gte(users.createdAt, monday),
          lte(users.createdAt, sunday)
        )
      );

    return result[0].count;
  }
}
