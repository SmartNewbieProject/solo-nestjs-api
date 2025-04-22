import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users } from '@/database/schema';
import { count, sql, and, gte, lt, lte } from 'drizzle-orm';
import { SignupTrendPoint } from '../dto/stats.dto';

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

  /**
   * 일별 회원가입 추이 데이터를 조회합니다.
   * 최근 30일간의 일별 회원가입자 수를 조회합니다.
   */
  async getDailySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const result: SignupTrendPoint[] = [];

    // 최근 30일간의 데이터 조회
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, startOfDay),
            lt(users.createdAt, endOfDay)
          )
        );

      // 날짜 표시 형식: MM월 DD일
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const label = `${month}월 ${day}일`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }

  /**
   * 주별 회원가입 추이 데이터를 조회합니다.
   * 최근 12주간의 주별 회원가입자 수를 조회합니다.
   */
  async getWeeklySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const result: SignupTrendPoint[] = [];

    // 이번 주의 월요일 가져오기
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);

    // 최근 12주간의 데이터 조회
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(thisMonday);
      weekStart.setDate(thisMonday.getDate() - (7 * i));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, weekStart),
            lte(users.createdAt, weekEnd)
          )
        );

      // 주간 라벨 생성 (MM월 DD일 ~ MM월 DD일)
      const startMonth = weekStart.getMonth() + 1;
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.getMonth() + 1;
      const endDay = weekEnd.getDate();

      // 주간 라벨 형식: MM월 DD일 ~ MM월 DD일
      const label = `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }

  /**
   * 월별 회원가입 추이 데이터를 조회합니다.
   * 최근 12개월간의 월별 회원가입자 수를 조회합니다.
   */
  async getMonthlySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const result: SignupTrendPoint[] = [];

    // 최근 12개월간의 데이터 조회
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);

      // 다음 달의 1일에서 1밀리초를 빼서 현재 달의 마지막 날 23:59:59.999 가져오기
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
      endOfMonth.setMilliseconds(-1);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, startOfMonth),
            lte(users.createdAt, endOfMonth)
          )
        );

      // 월 라벨 형식: YYYY년 MM월
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = `${year}년 ${month}월`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }
}
