import { Injectable } from '@nestjs/common';
import { likes } from '@/database/schema';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import { InjectDrizzle } from '@/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class LikeRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async like(userId: string, articleId: string) {
    const existsLike = await this.db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.articleId, articleId)))
      .limit(1)
      .then((result) => {
        if (result.length === 0) {
          return null;
        }
        return result[0];
      });

    if (!existsLike) {
      await this.db
        .insert(likes)
        .values({
          id: generateUuidV7(),
          userId,
          articleId,
          up: true,
        })
        .execute();
      return;
    }

    await this.db
      .update(likes)
      .set({ up: !existsLike.up })
      .where(and(eq(likes.userId, userId), eq(likes.articleId, articleId)))
      .execute();
  }

  async hasUserLikedArticle(userId: string, articleId: string) {
    const result = await this.db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.articleId, articleId),
          eq(likes.up, true),
        ),
      );

    return result.length > 0;
  }

  async hasUserLikedArticles(userId: string, articleIds: string[]) {
    if (!articleIds.length) return {};

    const result = await this.db
      .select({ articleId: likes.articleId })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.up, true),
          sql`${likes.articleId} IN (${sql.join(articleIds, sql`, `)})`,
        ),
      );

    const likedMap: Record<string, boolean> = {};
    result.forEach((like) => {
      likedMap[like.articleId] = true;
    });

    return likedMap;
  }
}
