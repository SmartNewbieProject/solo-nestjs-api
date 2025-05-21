import { Injectable, Logger } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { articles, hotArticles, likes, comments } from "@database/schema";
import { HotArticleCalculator } from "../domain/hot-article-calculator";
import { eq, and, isNull, gte, sql, count } from "drizzle-orm";
import { generateUuidV7 } from "@database/schema/helper";
import { Cron } from "@nestjs/schedule";

// TODO: 리팩터링 및 이해 필요
@Injectable()
export class HotArticleService {
  private readonly logger = new Logger(HotArticleService.name);

  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  @Cron('0 */1 * * *')
  async checkHotArticles() {
    try {
      // 트랜잭션 내에서 어드바이저리 락 획득 및 처리
      return await this.db.transaction(async (tx) => {
        // 어드바이저리 락 획득 (락 ID는 임의의 고유 값)
        const lockId = 12345678; // 고유한 숫자 ID 사용

        // this.logger.log(`인기 게시글 처리 시작 - 어드바이저리 락 획득 시도 (ID: ${lockId})`);

        // 트랜잭션 수준 락 획득 (트랜잭션이 끝나면 자동으로 해제됨)
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);

        // this.logger.log('어드바이저리 락 획득 성공');

        // 기존 로직 실행
        const recentArticleIds = await tx
          .select({
            id: articles.id,
            readCount: articles.readCount,
          })
          .from(articles)
          .where(
            and(
              gte(articles.createdAt, sql`NOW() - INTERVAL '24 hours'`),
              isNull(articles.deletedAt),
            )
          ).execute();

        // this.logger.log(`최근 24시간 내 게시글 ${recentArticleIds.length}개 조회 완료`);

        if (recentArticleIds.length === 0) {
          return { success: 0 };
        }

        const recentArticles = await Promise.all(
          recentArticleIds.map(async (article) => {
            const likeCountResult = await tx
              .select({ count: count() })
              .from(likes)
              .where(
                and(
                  eq(likes.articleId, article.id),
                  eq(likes.up, true),
                  isNull(likes.deletedAt)
                )
              ).execute();

            const commentCountResult = await tx
              .select({ count: count() })
              .from(comments)
              .where(
                and(
                  eq(comments.articleId, article.id),
                  isNull(comments.deletedAt)
                )
              ).execute();

            return {
              id: article.id,
              viewCount: article.readCount,
              likeCount: Number(likeCountResult[0].count),
              commentCount: Number(commentCountResult[0].count),
            };
          })
        );

        // this.logger.log(`${recentArticles.length}개 게시글의 좋아요 및 댓글 수 집계 완료`);

        const processPromises = recentArticles.map(async (article) => {
          try {
            const score = HotArticleCalculator.calculateScore(
              article.viewCount,
              Number(article.likeCount),
              Number(article.commentCount)
            );

            const existingHot = await tx
              .query
              .hotArticles.findFirst({
                where: eq(hotArticles.articleId, article.id),
              });

            if (HotArticleCalculator.isHot(score) && !existingHot) {
              await tx.insert(hotArticles).values({
                id: generateUuidV7(),
                articleId: article.id,
              });

              // this.logger.log(`새로운 인기 게시글 등록: ${article.id} (Score: ${score.toFixed(2)})`);
              return { status: 'success', articleId: article.id, score };
            }
            return { status: 'skipped', articleId: article.id, score };
          } catch (error) {
            // this.logger.error(`인기 게시글 처리 중 오류 발생 (게시글 ID: ${article.id}):`, error);
            return { status: 'error', articleId: article.id, error };
          }
        });

        const results = await Promise.allSettled(processPromises);

        const stats = results.reduce((acc, result) => {
          if (result.status === 'fulfilled') {
            acc[result.value.status] = (acc[result.value.status] || 0) + 1;
          } else {
            acc.rejected = (acc.rejected || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        this.logger.log(`인기 게시글 처리 완료 - 통계: ${JSON.stringify(stats)}`);
        return stats;
      });
    } catch (error) {
      // this.logger.error('인기 게시글 체크 중 오류 발생:', error);
      return { error: true };
    }
  }
}
