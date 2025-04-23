import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { RedisService } from '@/config/redis/redis.service';
import { UserActivityStatsResponse } from '../dto/activity-stats.dto';
import { users } from '@/database/schema';
import { count, sql } from 'drizzle-orm';

@Injectable()
export class AdminActivityService {
  private readonly logger = new Logger(AdminActivityService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly drizzleService: DrizzleService,
  ) {}

  /**
   * 사용자 활동 지표를 조회합니다.
   * @returns {Promise<UserActivityStatsResponse>} 사용자 활동 지표 정보
   */
  async getUserActivityStats(): Promise<UserActivityStatsResponse> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentWeek = this.getWeekNumber(now);

      // 각 지표 조회
      const [
        totalUsers,
        realtimeActiveUsers,
        dau,
        wau,
        mau,
        hourlyDistribution,
      ] = await Promise.all([
        // 전체 사용자 수 (DB에서 조회)
        this.getTotalUsersCount(),

        // 실시간 활성 사용자 수 (Redis 키 패턴 검색)
        this.getRealtimeActiveUsers(),

        // 일간 활성 사용자 수 (HyperLogLog 카디널리티)
        this.getDailyActiveUsers(today),

        // 주간 활성 사용자 수 (HyperLogLog 카디널리티)
        this.getWeeklyActiveUsers(currentYear, currentWeek),

        // 월간 활성 사용자 수 (HyperLogLog 카디널리티)
        this.getMonthlyActiveUsers(currentYear, currentMonth),

        // 시간대별 활성 사용자 분포
        this.getHourlyDistribution(today),
      ]);

      // 활성 사용자 수 (DAU와 동일)
      const activeUsers = dau;

      // 활성화율 계산 (전체 가입자 중 활성 사용자 비율)
      const activationRate = totalUsers > 0
        ? parseFloat(((activeUsers / totalUsers) * 100).toFixed(2))
        : 0;

      // Stickiness 계산 (DAU/MAU 비율)
      const stickiness = mau > 0
        ? parseFloat(((dau / mau) * 100).toFixed(2))
        : 0;

      return {
        totalUsers,
        activeUsers,
        mau,
        wau,
        dau,
        realtimeActiveUsers,
        activationRate,
        stickiness,
        hourlyDistribution,
      };
    } catch (error) {
      this.logger.error(`사용자 활동 지표 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 전체 사용자 수 조회 (DB에서 조회)
   */
  private async getTotalUsersCount(): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    return result[0].count;
  }

  /**
   * 실시간 활성 사용자 수 조회 (Redis 키 패턴 검색)
   */
  private async getRealtimeActiveUsers(): Promise<number> {
    const keys = await this.redisService.keys('user:active:*');
    return keys.length;
  }

  /**
   * 일간 활성 사용자 수 조회 (HyperLogLog 카디널리티)
   */
  private async getDailyActiveUsers(date: string): Promise<number> {
    return await this.redisService.pfcount(`user:daily:${date}`);
  }

  /**
   * 주간 활성 사용자 수 조회 (HyperLogLog 카디널리티)
   */
  private async getWeeklyActiveUsers(year: number, week: number): Promise<number> {
    return await this.redisService.pfcount(`user:weekly:${year}:${week}`);
  }

  /**
   * 월간 활성 사용자 수 조회 (HyperLogLog 카디널리티)
   */
  private async getMonthlyActiveUsers(year: number, month: number): Promise<number> {
    return await this.redisService.pfcount(`user:monthly:${year}:${month}`);
  }

  /**
   * 시간대별 활성 사용자 분포 조회
   */
  private async getHourlyDistribution(date: string): Promise<Array<{ hour: number, count: number }>> {
    const distribution: Array<{ hour: number, count: number }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const count = await this.redisService.pfcount(`user:hourly:${date}:${hour}`);
      distribution.push({ hour, count });
    }

    return distribution;
  }

  /**
   * 주 번호 계산 (ISO 8601 기준)
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
