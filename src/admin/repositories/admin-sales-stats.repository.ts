import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { payHistories } from '@/database/schema';
import { count, sql, and, gte, lt, lte, eq, desc, sum, isNotNull } from 'drizzle-orm';
import { SalesTrendPoint } from '../dto/sales-stats.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class AdminSalesStatsRepository {
  private readonly logger = new Logger(AdminSalesStatsRepository.name);

  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 총 매출액을 조회합니다.
   */
  async getTotalSales(): Promise<{ totalAmount: number; totalCount: number }> {
    try {
      const result = await this.drizzleService.db
        .select({
          totalAmount: sum(payHistories.amount),
          totalCount: count(),
        })
        .from(payHistories)
        .where(isNotNull(payHistories.paidAt));

      return {
        totalAmount: Number(result[0].totalAmount) || 0,
        totalCount: Number(result[0].totalCount) || 0,
      };
    } catch (error) {
      this.logger.error(`총 매출액 조회 오류: ${error.message}`, error.stack);
      return { totalAmount: 0, totalCount: 0 };
    }
  }

  /**
   * 오늘 매출액을 조회합니다.
   * 오늘 00:00:00부터 23:59:59까지 결제된 내역을 집계합니다.
   */
  async getDailySales(): Promise<{ dailyAmount: number; dailyCount: number }> {
    try {
      // 오늘 날짜의 시작(00:00:00)과 끝(23:59:59) 설정
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const result = await this.drizzleService.db
        .select({
          dailyAmount: sum(payHistories.amount),
          dailyCount: count(),
        })
        .from(payHistories)
        .where(
          and(
            gte(payHistories.paidAt, startOfDay),
            lt(payHistories.paidAt, endOfDay)
          )
        );

      return {
        dailyAmount: Number(result[0].dailyAmount) || 0,
        dailyCount: Number(result[0].dailyCount) || 0,
      };
    } catch (error) {
      this.logger.error(`일간 매출액 조회 오류: ${error.message}`, error.stack);
      return { dailyAmount: 0, dailyCount: 0 };
    }
  }

  /**
   * 이번 주 매출액을 조회합니다.
   * 이번 주 월요일 00:00:00부터 일요일 23:59:59까지 결제된 내역을 집계합니다.
   */
  async getWeeklySales(): Promise<{ weeklyAmount: number; weeklyCount: number }> {
    try {
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
        .select({
          weeklyAmount: sum(payHistories.amount),
          weeklyCount: count(),
        })
        .from(payHistories)
        .where(
          and(
            gte(payHistories.paidAt, monday),
            lte(payHistories.paidAt, sunday)
          )
        );

      return {
        weeklyAmount: Number(result[0].weeklyAmount) || 0,
        weeklyCount: Number(result[0].weeklyCount) || 0,
      };
    } catch (error) {
      this.logger.error(`주간 매출액 조회 오류: ${error.message}`, error.stack);
      return { weeklyAmount: 0, weeklyCount: 0 };
    }
  }

  /**
   * 이번 달 매출액을 조회합니다.
   * 이번 달 1일 00:00:00부터 말일 23:59:59까지 결제된 내역을 집계합니다.
   */
  async getMonthlySales(): Promise<{ monthlyAmount: number; monthlyCount: number }> {
    try {
      // 이번 달 1일 구하기
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);

      // 이번 달 말일 구하기
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

      const result = await this.drizzleService.db
        .select({
          monthlyAmount: sum(payHistories.amount),
          monthlyCount: count(),
        })
        .from(payHistories)
        .where(
          and(
            gte(payHistories.paidAt, firstDayOfMonth),
            lte(payHistories.paidAt, lastDayOfMonth)
          )
        );

      return {
        monthlyAmount: Number(result[0].monthlyAmount) || 0,
        monthlyCount: Number(result[0].monthlyCount) || 0,
      };
    } catch (error) {
      this.logger.error(`월간 매출액 조회 오류: ${error.message}`, error.stack);
      return { monthlyAmount: 0, monthlyCount: 0 };
    }
  }

  /**
   * 사용자 지정 기간 내 매출액을 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   */
  async getCustomPeriodSales(startDate: string, endDate: string): Promise<{ totalAmount: number; totalCount: number }> {
    try {
      // 특수 키워드 처리
      if (startDate === 'this-week' && endDate === 'this-week') {
        const weeklyResult = await this.getWeeklySales();
        return {
          totalAmount: weeklyResult.weeklyAmount,
          totalCount: weeklyResult.weeklyCount,
        };
      }

      // 날짜 문자열을 Date 객체로 변환
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      const result = await this.drizzleService.db
        .select({
          totalAmount: sum(payHistories.amount),
          totalCount: count(),
        })
        .from(payHistories)
        .where(
          and(
            gte(payHistories.paidAt, start),
            lte(payHistories.paidAt, end)
          )
        );

      return {
        totalAmount: Number(result[0].totalAmount) || 0,
        totalCount: Number(result[0].totalCount) || 0,
      };
    } catch (error) {
      this.logger.error(`사용자 지정 기간 매출액 조회 오류: ${error.message}`, error.stack);
      return { totalAmount: 0, totalCount: 0 };
    }
  }

  /**
   * 일별 매출 추이 데이터를 조회합니다.
   * 최근 30일간의 일별 매출액을 조회합니다.
   */
  async getDailySalesTrend(): Promise<SalesTrendPoint[]> {
    try {
      const today = new Date();
      const result: SalesTrendPoint[] = [];

      // 최근 30일 동안의 일별 매출액 조회
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        const salesResult = await this.drizzleService.db
          .select({
            amount: sum(payHistories.amount),
            count: count(),
          })
          .from(payHistories)
          .where(
            and(
              gte(payHistories.paidAt, startOfDay),
              lt(payHistories.paidAt, endOfDay)
            )
          );

        result.push({
          label: dayjs(date).format('YYYY-MM-DD'),
          amount: Number(salesResult[0].amount) || 0,
          count: Number(salesResult[0].count) || 0,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`일별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 주별 매출 추이 데이터를 조회합니다.
   * 최근 12주간의 주별 매출액을 조회합니다.
   */
  async getWeeklySalesTrend(): Promise<SalesTrendPoint[]> {
    try {
      const result: SalesTrendPoint[] = [];
      const today = new Date();

      // 최근 12주 동안의 주별 매출액 조회
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

        const salesResult = await this.drizzleService.db
          .select({
            amount: sum(payHistories.amount),
            count: count(),
          })
          .from(payHistories)
          .where(
            and(
              gte(payHistories.paidAt, monday),
              lte(payHistories.paidAt, sunday)
            )
          );

        result.push({
          label: `${dayjs(monday).format('MM/DD')}~${dayjs(sunday).format('MM/DD')}`,
          amount: Number(salesResult[0].amount) || 0,
          count: Number(salesResult[0].count) || 0,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`주별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 월별 매출 추이 데이터를 조회합니다.
   * 최근 12개월간의 월별 매출액을 조회합니다.
   */
  async getMonthlySalesTrend(): Promise<SalesTrendPoint[]> {
    try {
      const result: SalesTrendPoint[] = [];
      const today = new Date();

      // 최근 12개월 동안의 월별 매출액 조회
      for (let i = 11; i >= 0; i--) {
        const year = today.getFullYear();
        const month = today.getMonth() - i;

        // 월이 음수인 경우 이전 연도로 조정
        const adjustedYear = month < 0 ? year - 1 : year;
        const adjustedMonth = month < 0 ? 12 + month : month;

        const firstDayOfMonth = new Date(adjustedYear, adjustedMonth, 1, 0, 0, 0);
        const lastDayOfMonth = new Date(adjustedYear, adjustedMonth + 1, 0, 23, 59, 59, 999);

        const salesResult = await this.drizzleService.db
          .select({
            amount: sum(payHistories.amount),
            count: count(),
          })
          .from(payHistories)
          .where(
            and(
              gte(payHistories.paidAt, firstDayOfMonth),
              lte(payHistories.paidAt, lastDayOfMonth)
            )
          );

        result.push({
          label: dayjs(firstDayOfMonth).format('YYYY-MM'),
          amount: Number(salesResult[0].amount) || 0,
          count: Number(salesResult[0].count) || 0,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`월별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 사용자 지정 기간 내 일별 매출 추이 데이터를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   */
  async getCustomPeriodSalesTrend(startDate: string, endDate: string): Promise<SalesTrendPoint[]> {
    try {
      const result: SalesTrendPoint[] = [];

      // 날짜 문자열을 Date 객체로 변환
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      // 날짜 차이 계산 (일 단위)
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 일별 매출액 조회
      for (let i = 0; i <= diffDays; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        const salesResult = await this.drizzleService.db
          .select({
            amount: sum(payHistories.amount),
            count: count(),
          })
          .from(payHistories)
          .where(
            and(
              gte(payHistories.paidAt, startOfDay),
              lte(payHistories.paidAt, endOfDay)
            )
          );

        result.push({
          label: dayjs(date).format('YYYY-MM-DD'),
          amount: Number(salesResult[0].amount) || 0,
          count: Number(salesResult[0].count) || 0,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`사용자 지정 기간 매출 추이 조회 오류: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 결제 성공률을 계산합니다.
   * 결제 성공률 = (성공한 결제 건수 / 총 결제 시도 건수) * 100
   */
  async getPaymentSuccessRate(): Promise<{
    date: string;
    totalAttempts: number;
    successfulPayments: number;
    successRate: number;
  }> {
    try {
      const today = new Date();

      // 전체 결제 시도 건수 조회 (orderId가 있는 모든 건)
      const totalAttemptsResult = await this.drizzleService.db
        .select({ count: count() })
        .from(payHistories)
        .where(isNotNull(payHistories.orderId));

      // 성공한 결제 건수 조회 (paidAt이 있는 건)
      const successfulPaymentsResult = await this.drizzleService.db
        .select({ count: count() })
        .from(payHistories)
        .where(isNotNull(payHistories.paidAt));

      const totalAttempts = totalAttemptsResult[0].count || 0;
      const successfulPayments = successfulPaymentsResult[0].count || 0;

      // 결제 성공률 계산
      const successRate = totalAttempts > 0
        ? parseFloat(((successfulPayments / totalAttempts) * 100).toFixed(2))
        : 0;

      return {
        date: dayjs(today).format('YYYY-MM-DD'),
        totalAttempts,
        successfulPayments,
        successRate,
      };
    } catch (error) {
      this.logger.error(`결제 성공률 조회 오류: ${error.message}`, error.stack);
      return {
        date: dayjs(new Date()).format('YYYY-MM-DD'),
        totalAttempts: 0,
        successfulPayments: 0,
        successRate: 0,
      };
    }
  }
}
