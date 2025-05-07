import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/config/redis/redis.service';
import { InjectDrizzle } from '@/common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { articles } from '@database/schema';
import { eq } from 'drizzle-orm';
import { Cron } from '@nestjs/schedule';
import { ViewCountKeyManager, ViewCountSyncProcessor } from '../domain/view-count-sync';

@Injectable()
export class ArticleViewService {
  private readonly logger = new Logger(ArticleViewService.name);
  private readonly VIEW_COUNT_PREFIX = 'article:view:';
  private readonly BATCH_SIZE = 100;
  private readonly keyManager: ViewCountKeyManager;
  private readonly syncProcessor: ViewCountSyncProcessor;

  constructor(
    private readonly redisService: RedisService,
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {
    this.keyManager = new ViewCountKeyManager(this.VIEW_COUNT_PREFIX);
    this.syncProcessor = new ViewCountSyncProcessor(
      this.redisService,
      this.db,
      this.BATCH_SIZE,
      this.VIEW_COUNT_PREFIX
    );
  }

  async incrementViewCount(articleId: string, userId?: string): Promise<void> {
    const key = this.keyManager.getViewCountKey(articleId);

    if (userId) {
      const userViewKey = this.keyManager.getUserViewKey(articleId, userId);
      const hasViewed = await this.redisService.get(userViewKey);

      if (hasViewed) {
        return;
      }
      await this.redisService.set(userViewKey, '1', 86400);
    }

    await this.redisService.incr(key);
  }


  async getViewCount(articleId: string): Promise<number> {
    const tempCount = await this.getViewWithoutDbCount(articleId);
    const result = await this.db
      .select({ readCount: articles.readCount })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    const dbCount = result[0]?.readCount || 0;

    return dbCount + tempCount;
  }

  async getViewWithoutDbCount(articleId: string): Promise<number> {
    const key = this.keyManager.getViewCountKey(articleId);
    const redisCount = await this.redisService.get(key);
    const tempCount = redisCount ? parseInt(redisCount, 10) : 0;
    return tempCount;
  }

  @Cron('0 */1 * * * *')
  async syncViewCountsToDB(): Promise<void> {
    try {
      const keys = await this.syncProcessor.getViewCountKeys();

      if (keys.length === 0) {
        this.logger.log('동기화할 조회수가 없습니다.');
        return;
      }

      const result = await this.syncProcessor.processBatches(keys);

      this.logger.log(
        `조회수 동기화 완료: 총 ${result.processedCount}개 처리 ` +
        `(성공: ${result.successCount}, 실패: ${result.failedCount})`
      );
      if (result.errors.length > 0) {
        this.logger.warn(`${result.errors.length}개의 오류가 발생했습니다.`);
        result.errors.forEach((error, index) => {
          this.logger.error(`오류 ${index + 1}: ${error.message}`);
        });
      }
    } catch (error) {
      this.logger.error('조회수 동기화 중 오류 발생:', error);
    }
  }

}
