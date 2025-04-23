import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users } from '@/database/schema';
import { withdrawalReasons } from '@/database/schema/withdrawal_reasons';
import { count, sql, and, gte, lt, lte, eq, desc, avg, or, isNull } from 'drizzle-orm';
import { WithdrawalTrendPoint } from '../dto/withdrawal-stats.dto';
import { WithdrawalReason, withdrawalReasonDisplayNames } from '@/types/withdrawal';
import * as dayjs from 'dayjs';

@Injectable()
export class AdminWithdrawalStatsRepository {
  private readonly logger = new Logger(AdminWithdrawalStatsRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 총 탈퇴자 수를 조회합니다.
   */
  async getTotalWithdrawalsCount(): Promise<number> {
    try {
      const result = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons);

      return result[0].count;
    } catch (error) {
      this.logger.error(`총 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * 오늘 탈퇴한 회원 수를 조회합니다.
   * 오늘 00:00:00부터 23:59:59까지 탈퇴한 사용자를 카운트합니다.
   */
  async getDailyWithdrawalCount(): Promise<number> {
    try {
      // 오늘 날짜의 시작(00:00:00)과 끝(23:59:59) 설정
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const result = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons)
        .where(
          and(
            gte(withdrawalReasons.withdrawnAt, startOfDay),
            lt(withdrawalReasons.withdrawnAt, endOfDay)
          )
        );

      return result[0].count;
    } catch (error) {
      this.logger.error(`일간 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * 이번 주 탈퇴한 회원 수를 조회합니다.
   * 이번 주 월요일 00:00:00부터 일요일 23:59:59까지 탈퇴한 사용자를 카운트합니다.
   */
  async getWeeklyWithdrawalCount(): Promise<number> {
    // 이번 주 월요일 구하기
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 일요일이면 -6, 아니면 +1
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // 이번 주 일요일 구하기
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, monday),
          lte(withdrawalReasons.withdrawnAt, sunday)
        )
      );

    return result[0].count;
  }

  /**
   * 이번 달 탈퇴한 회원 수를 조회합니다.
   * 이번 달 1일 00:00:00부터 말일 23:59:59까지 탈퇴한 사용자를 카운트합니다.
   */
  async getMonthlyWithdrawalCount(): Promise<number> {
    // 이번 달 1일 구하기
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);

    // 이번 달 말일 구하기
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, firstDayOfMonth),
          lte(withdrawalReasons.withdrawnAt, lastDayOfMonth)
        )
      );

    return result[0].count;
  }

  /**
   * 사용자 지정 기간 내 탈퇴한 회원 수를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   */
  async getCustomPeriodWithdrawalCount(startDate: string, endDate: string): Promise<number> {
    // 특수 키워드 처리
    if (startDate === 'this-week' && endDate === 'this-week') {
      return this.getWeeklyWithdrawalCount();
    }

    // 날짜 문자열을 Date 객체로 변환
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, start),
          lte(withdrawalReasons.withdrawnAt, end)
        )
      );

    return result[0].count;
  }

  /**
   * 일별 탈퇴 추이 데이터를 조회합니다.
   * 최근 30일간의 일별 탈퇴자 수를 조회합니다.
   */
  async getDailyWithdrawalTrend(): Promise<WithdrawalTrendPoint[]> {
    const today = new Date();
    const result: WithdrawalTrendPoint[] = [];

    // 최근 30일 동안의 일별 탈퇴자 수 조회
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons)
        .where(
          and(
            gte(withdrawalReasons.withdrawnAt, startOfDay),
            lt(withdrawalReasons.withdrawnAt, endOfDay)
          )
        );

      result.push({
        label: dayjs(date).format('YYYY-MM-DD'),
        count: countResult[0].count,
      });
    }

    return result;
  }

  /**
   * 주별 탈퇴 추이 데이터를 조회합니다.
   * 최근 12주간의 주별 탈퇴자 수를 조회합니다.
   */
  async getWeeklyWithdrawalTrend(): Promise<WithdrawalTrendPoint[]> {
    const result: WithdrawalTrendPoint[] = [];
    const today = new Date();

    // 최근 12주 동안의 주별 탈퇴자 수 조회
    for (let i = 11; i >= 0; i--) {
      // i주 전의 월요일 구하기
      const date = new Date(today);
      date.setDate(today.getDate() - (7 * i));
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      // i주 전의 일요일 구하기
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons)
        .where(
          and(
            gte(withdrawalReasons.withdrawnAt, monday),
            lte(withdrawalReasons.withdrawnAt, sunday)
          )
        );

      result.push({
        label: `${dayjs(monday).format('MM/DD')}~${dayjs(sunday).format('MM/DD')}`,
        count: countResult[0].count,
      });
    }

    return result;
  }

  /**
   * 월별 탈퇴 추이 데이터를 조회합니다.
   * 최근 12개월간의 월별 탈퇴자 수를 조회합니다.
   */
  async getMonthlyWithdrawalTrend(): Promise<WithdrawalTrendPoint[]> {
    const result: WithdrawalTrendPoint[] = [];
    const today = new Date();

    // 최근 12개월 동안의 월별 탈퇴자 수 조회
    for (let i = 11; i >= 0; i--) {
      const year = today.getFullYear();
      const month = today.getMonth() - i;

      // 월이 음수인 경우 이전 연도로 조정
      const adjustedYear = month < 0 ? year - 1 : year;
      const adjustedMonth = month < 0 ? 12 + month : month;

      const firstDayOfMonth = new Date(adjustedYear, adjustedMonth, 1, 0, 0, 0);
      const lastDayOfMonth = new Date(adjustedYear, adjustedMonth + 1, 0, 23, 59, 59, 999);

      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons)
        .where(
          and(
            gte(withdrawalReasons.withdrawnAt, firstDayOfMonth),
            lte(withdrawalReasons.withdrawnAt, lastDayOfMonth)
          )
        );

      result.push({
        label: dayjs(firstDayOfMonth).format('YYYY-MM'),
        count: countResult[0].count,
      });
    }

    return result;
  }

  /**
   * 사용자 지정 기간 내 일별 탈퇴 추이 데이터를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   */
  async getCustomPeriodWithdrawalTrend(startDate: string, endDate: string): Promise<WithdrawalTrendPoint[]> {
    const result: WithdrawalTrendPoint[] = [];

    // 날짜 문자열을 Date 객체로 변환
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // 날짜 차이 계산 (일 단위)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 일별 탈퇴자 수 조회
    for (let i = 0; i <= diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const countResult = await this.drizzleService.db
        .select({ count: count() })
        .from(withdrawalReasons)
        .where(
          and(
            gte(withdrawalReasons.withdrawnAt, startOfDay),
            lte(withdrawalReasons.withdrawnAt, endOfDay)
          )
        );

      result.push({
        label: dayjs(date).format('YYYY-MM-DD'),
        count: countResult[0].count,
      });
    }

    return result;
  }

  /**
   * 탈퇴 사유별 통계를 조회합니다.
   */
  async getWithdrawalReasonStats(): Promise<{
    totalWithdrawals: number;
    reasons: Array<{
      reason: WithdrawalReason;
      displayName: string;
      count: number;
      percentage: number;
    }>;
  }> {
    // 전체 탈퇴자 수 조회
    const totalResult = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons);

    const totalWithdrawals = totalResult[0].count;

    // 탈퇴 사유별 카운트 조회
    const reasonCounts = await Promise.all(
      Object.values(WithdrawalReason).map(async (reason) => {
        const result = await this.drizzleService.db
          .select({ count: count() })
          .from(withdrawalReasons)
          .where(eq(withdrawalReasons.reason, reason));

        const countValue = result[0].count;
        const percentage = totalWithdrawals > 0
          ? parseFloat(((countValue / totalWithdrawals) * 100).toFixed(1))
          : 0;

        return {
          reason,
          displayName: withdrawalReasonDisplayNames[reason],
          count: countValue,
          percentage,
        };
      })
    );

    // 카운트 내림차순으로 정렬
    const sortedReasons = reasonCounts.sort((a, b) => b.count - a.count);

    return {
      totalWithdrawals,
      reasons: sortedReasons,
    };
  }

  /**
   * 서비스 사용 기간 통계를 조회합니다.
   */
  async getServiceDurationStats(): Promise<{
    totalWithdrawals: number;
    averageDurationDays: number;
    durations: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  }> {
    // 전체 탈퇴자 수 조회
    const totalResult = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons);

    const totalWithdrawals = totalResult[0].count;

    // 평균 서비스 사용 기간 조회
    const avgResult = await this.drizzleService.db
      .select({ average: avg(withdrawalReasons.serviceDurationDays) })
      .from(withdrawalReasons);

    const averageDurationDays = avgResult[0].average
      ? parseFloat(String(avgResult[0].average))
      : 0;

    // 서비스 사용 기간 범위 정의
    const durationRanges = [
      { min: 0, max: 7, label: '0-7일' },
      { min: 8, max: 30, label: '8-30일' },
      { min: 31, max: 90, label: '31-90일' },
      { min: 91, max: 180, label: '91-180일' },
      { min: 181, max: 365, label: '181-365일' },
      { min: 366, max: Number.MAX_SAFE_INTEGER, label: '366일 이상' },
    ];

    // 각 범위별 카운트 조회
    const durationCounts = await Promise.all(
      durationRanges.map(async (range) => {
        const result = await this.drizzleService.db
          .select({ count: count() })
          .from(withdrawalReasons)
          .where(
            and(
              gte(withdrawalReasons.serviceDurationDays, range.min),
              lte(withdrawalReasons.serviceDurationDays, range.max)
            )
          );

        const countValue = result[0].count;
        const percentage = totalWithdrawals > 0
          ? parseFloat(((countValue / totalWithdrawals) * 100).toFixed(1))
          : 0;

        return {
          range: range.label,
          count: countValue,
          percentage,
        };
      })
    );

    return {
      totalWithdrawals,
      averageDurationDays,
      durations: durationCounts,
    };
  }

  /**
   * 이탈률을 계산합니다.
   * 이탈률 = (특정 기간 탈퇴자 수 / 해당 기간 시작 시점의 전체 사용자 수) * 100
   */
  async getChurnRate(): Promise<{
    date: string;
    dailyChurnRate: number;
    weeklyChurnRate: number;
    monthlyChurnRate: number;
  }> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 어제 날짜의 시작과 끝
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    // 일주일 전 날짜
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // 한 달 전 날짜
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    // 어제 시작 시점의 전체 사용자 수 조회 (어제 00:00:00 기준)
    const totalUsersYesterdayStart = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          lt(users.createdAt, startOfYesterday),
          or(
            isNull(users.deletedAt),
            gte(users.deletedAt, startOfYesterday)
          )
        )
      );

    // 일주일 전 시작 시점의 전체 사용자 수 조회
    const totalUsersWeekAgo = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          lt(users.createdAt, oneWeekAgo),
          or(
            isNull(users.deletedAt),
            gte(users.deletedAt, oneWeekAgo)
          )
        )
      );

    // 한 달 전 시작 시점의 전체 사용자 수 조회
    const totalUsersMonthAgo = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          lt(users.createdAt, oneMonthAgo),
          or(
            isNull(users.deletedAt),
            gte(users.deletedAt, oneMonthAgo)
          )
        )
      );

    // 일간 탈퇴자 수 조회 (어제)
    const dailyWithdrawals = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, startOfYesterday),
          lte(withdrawalReasons.withdrawnAt, endOfYesterday)
        )
      );

    // 주간 탈퇴자 수 조회 (최근 7일)
    const weeklyWithdrawals = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, oneWeekAgo),
          lt(withdrawalReasons.withdrawnAt, today)
        )
      );

    // 월간 탈퇴자 수 조회 (최근 30일)
    const monthlyWithdrawals = await this.drizzleService.db
      .select({ count: count() })
      .from(withdrawalReasons)
      .where(
        and(
          gte(withdrawalReasons.withdrawnAt, oneMonthAgo),
          lt(withdrawalReasons.withdrawnAt, today)
        )
      );

    // 이탈률 계산
    const dailyChurnRate = totalUsersYesterdayStart[0].count > 0
      ? parseFloat(((dailyWithdrawals[0].count / totalUsersYesterdayStart[0].count) * 100).toFixed(2))
      : 0;

    const weeklyChurnRate = totalUsersWeekAgo[0].count > 0
      ? parseFloat(((weeklyWithdrawals[0].count / totalUsersWeekAgo[0].count) * 100).toFixed(2))
      : 0;

    const monthlyChurnRate = totalUsersMonthAgo[0].count > 0
      ? parseFloat(((monthlyWithdrawals[0].count / totalUsersMonthAgo[0].count) * 100).toFixed(2))
      : 0;

    return {
      date: dayjs(yesterday).format('YYYY-MM-DD'),
      dailyChurnRate,
      weeklyChurnRate,
      monthlyChurnRate,
    };
  }
}
