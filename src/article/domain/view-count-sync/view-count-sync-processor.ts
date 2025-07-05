import { Logger } from '@nestjs/common';
import { RedisService } from '@/config/redis/redis.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { articles } from '@database/schema';
import { eq, sql } from 'drizzle-orm';
import { ViewCountKeyManager } from './view-count-key-manager';
import {
  BatchProcessResult,
  ViewCountUpdate,
  createEmptyBatchResult,
  updateBatchResult,
} from './view-count-batch-result';

export class ViewCountSyncProcessor {
  private readonly logger = new Logger(ViewCountSyncProcessor.name);
  private readonly keyManager: ViewCountKeyManager;

  constructor(
    private readonly redisService: RedisService,
    private readonly db: NodePgDatabase<any>,
    private readonly batchSize: number,
    prefix: string,
  ) {
    this.keyManager = new ViewCountKeyManager(prefix);
  }

  async getViewCountKeys(): Promise<string[]> {
    const pattern = this.keyManager.getViewCountPattern();
    return await this.redisService.keys(pattern);
  }

  async processBatches(keys: string[]): Promise<BatchProcessResult> {
    const batches: string[][] = [];

    for (let i = 0; i < keys.length; i += this.batchSize) {
      const batch = keys.slice(i, i + this.batchSize);
      batches.push(batch);
    }

    const batchPromises = batches.map((batch) => this.processBatch(batch));
    const results = await Promise.allSettled(batchPromises);

    const totalResult = results.reduce((acc, result, index) => {
      if (result.status === 'fulfilled') {
        const batchResult = result.value;
        this.logger.log(
          `배치 처리 완료: ${batches[index].length}개 키 (성공: ${batchResult.successCount}, 실패: ${batchResult.failedCount})`,
        );

        return {
          processedCount: acc.processedCount + batchResult.processedCount,
          successCount: acc.successCount + batchResult.successCount,
          failedCount: acc.failedCount + batchResult.failedCount,
          errors: [...acc.errors, ...batchResult.errors],
        };
      } else {
        this.logger.error(`배치 처리 실패:`, result.reason);
        return {
          ...acc,
          failedCount: acc.failedCount + batches[index].length,
          errors: [
            ...acc.errors,
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
          ],
        };
      }
    }, createEmptyBatchResult());

    return totalResult;
  }

  private async processBatch(batch: string[]): Promise<BatchProcessResult> {
    let result = createEmptyBatchResult();

    try {
      const pipeline = this.redisService.pipeline();

      batch.forEach((key) => {
        pipeline.get(key);
      });

      const pipelineResults = await pipeline.exec();
      if (!pipelineResults) {
        return result;
      }

      const updates = batch.map((key, index) => {
        const articleId = this.keyManager.extractArticleId(key);
        const count = parseInt(pipelineResults[index][1] as string, 10);
        return { articleId, count };
      });

      const updatePromises = updates.map(async (update) => {
        try {
          if (update.count > 0) {
            await this.updateArticleViewCount(update);
            await this.deleteRedisKey(update.articleId);
            return { success: true };
          } else {
            return { success: true };
          }
        } catch (error) {
          this.logger.error(
            `게시글 ID ${update.articleId} 조회수 업데이트 실패:`,
            error,
          );
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      });

      const updateResults = await Promise.allSettled(updatePromises);

      updateResults.forEach((updateResult) => {
        if (updateResult.status === 'fulfilled') {
          result = updateBatchResult(
            result,
            updateResult.value.success,
            updateResult.value.success ? undefined : updateResult.value.error,
          );
        } else {
          result = updateBatchResult(
            result,
            false,
            updateResult.reason instanceof Error
              ? updateResult.reason
              : new Error(String(updateResult.reason)),
          );
        }
      });
    } catch (error) {
      this.logger.error('배치 처리 중 오류 발생:', error);
      result = updateBatchResult(
        result,
        false,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return result;
  }

  private async updateArticleViewCount(update: ViewCountUpdate): Promise<void> {
    await this.db
      .update(articles)
      .set({
        readCount: sql`${articles.readCount} + ${update.count}`,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, update.articleId));
  }

  private async deleteRedisKey(articleId: string): Promise<void> {
    const key = this.keyManager.getViewCountKey(articleId);
    await this.redisService.del(key);
  }
}
