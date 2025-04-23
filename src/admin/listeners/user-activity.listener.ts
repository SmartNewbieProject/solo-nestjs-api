import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserActivityEvent } from '../events/user-activity.event';
import { RedisService } from '@/config/redis/redis.service';

@Injectable()
export class UserActivityListener {
  private readonly logger = new Logger(UserActivityListener.name);

  constructor(private readonly redisService: RedisService) {}

  @OnEvent('user.activity')
  async handleUserActivityEvent(event: UserActivityEvent) {
    try {
      const { userId, activityType, timestamp } = event;
      
      // 날짜 및 시간 정보
      const date = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const hour = timestamp.getHours();
      const week = this.getWeekNumber(timestamp);
      const month = timestamp.getMonth() + 1;
      const year = timestamp.getFullYear();
      
      // 파이프라인으로 여러 명령 일괄 처리 (성능 최적화)
      const pipeline = this.redisService.pipeline();
      
      // 1. 실시간 활성 사용자 추적 (30분 TTL)
      pipeline.set(`user:active:${userId}`, '1', 'EX', 1800);
      
      // 2. 일간 활성 사용자 집계 (HyperLogLog)
      pipeline.pfadd(`user:daily:${date}`, userId);
      
      // 3. 주간 활성 사용자 집계 (HyperLogLog)
      pipeline.pfadd(`user:weekly:${year}:${week}`, userId);
      
      // 4. 월간 활성 사용자 집계 (HyperLogLog)
      pipeline.pfadd(`user:monthly:${year}:${month}`, userId);
      
      // 5. 시간대별 활성 사용자 집계 (HyperLogLog)
      pipeline.pfadd(`user:hourly:${date}:${hour}`, userId);
      
      // 6. 활동 유형별 집계 (카운터)
      pipeline.incr(`activity:${activityType}:${date}`);
      
      // 7. 활동 시간 기록 (정렬된 집합)
      pipeline.zadd(`user:activity:${userId}`, timestamp.getTime(), `${activityType}:${timestamp.toISOString()}`);
      
      // 파이프라인 실행
      await pipeline.exec();
      
    } catch (error) {
      this.logger.error(`사용자 활동 처리 중 오류 발생: ${error.message}`, error.stack);
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
