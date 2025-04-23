import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleService } from '@/database/drizzle.service';
import { RedisService } from '@/config/redis/redis.service';
import { activityStats, weeklyActivityStats, monthlyActivityStats } from '@/database/schema/activity_stats';

@Injectable()
export class ActivityAggregatorService {
  private readonly logger = new Logger(ActivityAggregatorService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly drizzleService: DrizzleService,
  ) {}

  /**
   * 매일 자정에 실행되는 일간 활동 통계 집계
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyStats() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateKey = yesterday.toISOString().split('T')[0];

      // Redis에서 일간 활성 사용자 수 조회
      const dau = await this.redisService.pfcount(`user:daily:${dateKey}`);

      // 시간대별 활성 사용자 분포 조회
      const hourlyDistribution: Array<{hour: number, count: number}> = [];
      for (let hour = 0; hour < 24; hour++) {
        const count = await this.redisService.pfcount(`user:hourly:${dateKey}:${hour}`);
        hourlyDistribution.push({ hour, count });
      }

      // 활동 유형별 집계 조회
      const activityKeys = await this.redisService.keys(`activity:*:${dateKey}`);
      const activityCounts = {};

      for (const key of activityKeys) {
        const activityType = key.split(':')[1];
        const count = await this.redisService.get(key);
        activityCounts[activityType] = count ? parseInt(count, 10) : 0;
      }

      // DB에 집계 데이터 저장
      await this.drizzleService.db.insert(activityStats).values({
        id: crypto.randomUUID(),
        date: yesterday,
        dau,
        hourlyDistribution: JSON.stringify(hourlyDistribution),
        activityCounts: JSON.stringify(activityCounts),
      });

      this.logger.log(`일간 활동 통계 집계 완료: ${dateKey}`);
    } catch (error) {
      this.logger.error(`일간 활동 통계 집계 중 오류 발생: ${error.message}`, error.stack);
    }
  }

  /**
   * 매주 월요일 자정에 실행되는 주간 활동 통계 집계
   */
  @Cron(CronExpression.EVERY_WEEK)
  async aggregateWeeklyStats() {
    try {
      const lastWeekEnd = new Date();
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekStart.getDate() - 6);

      const year = lastWeekEnd.getFullYear();
      const week = this.getWeekNumber(lastWeekEnd);

      // Redis에서 주간 활성 사용자 수 조회
      const wau = await this.redisService.pfcount(`user:weekly:${year}:${week}`);

      // DB에 집계 데이터 저장
      await this.drizzleService.db.insert(weeklyActivityStats).values({
        id: crypto.randomUUID(),
        startDate: lastWeekStart,
        endDate: lastWeekEnd,
        wau,
      });

      this.logger.log(`주간 활동 통계 집계 완료: ${lastWeekStart.toISOString().split('T')[0]} ~ ${lastWeekEnd.toISOString().split('T')[0]}`);
    } catch (error) {
      this.logger.error(`주간 활동 통계 집계 중 오류 발생: ${error.message}`, error.stack);
    }
  }

  /**
   * 매월 1일 자정에 실행되는 월간 활동 통계 집계
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async aggregateMonthlyStats() {
    try {
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(0); // 이전 달의 마지막 날
      const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

      const year = lastMonthEnd.getFullYear();
      const month = lastMonthEnd.getMonth() + 1;

      // Redis에서 월간 활성 사용자 수 조회
      const mau = await this.redisService.pfcount(`user:monthly:${year}:${month}`);

      // DB에 집계 데이터 저장
      await this.drizzleService.db.insert(monthlyActivityStats).values({
        id: crypto.randomUUID(),
        startDate: lastMonthStart,
        endDate: lastMonthEnd,
        mau,
      });

      this.logger.log(`월간 활동 통계 집계 완료: ${lastMonthStart.toISOString().split('T')[0]} ~ ${lastMonthEnd.toISOString().split('T')[0]}`);
    } catch (error) {
      this.logger.error(`월간 활동 통계 집계 중 오류 발생: ${error.message}`, error.stack);
    }
  }

  /**
   * 주 번호 계산 (ISO 8601 기준)
   * @param date 날짜
   * @returns 주 번호 (1-53)
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
