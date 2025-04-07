import { Injectable } from '@nestjs/common';
import { articles } from '@/database/schema';
import { ArticleUpload } from '../dto';
import { sql, eq, and, isNull } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';

import { InjectDrizzle } from '@/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { generateAnonymousName } from '../domain';

@Injectable()
export class ArticleRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
) {}

  async createArticle(authorId: string, articleData: ArticleUpload) {
    const result = await this.db.insert(articles).values({
      id: generateUuidV7(),
      authorId,
      content: articleData.content,
      anonymous: articleData.anonymous ? generateAnonymousName() : null,
      emoji: articleData.emoji,
      likeCount: 0,
      blindedAt: null
    }).returning();

    return result[0];
  }

  async getArticles(limit: number = 10, offset: number = 0) {
    return await this.db.query.articles.findMany({
      with: {
        comments: {
          limit: 3,
          where: ({ deletedAt }) => isNull(deletedAt),
        },
        author: {
          columns: {
            id: true,
            name: true,
          },
        },
        likes: {
          columns: {
            id: true,
          },
          where: ({ up }) => eq(up, true)
        }
      },
      where: ({ deletedAt }) => isNull(deletedAt),
      limit,
      offset,
      orderBy: [sql`${articles.createdAt} DESC`]
    });
  }

  async getArticleById(id: string) {
    return await this.db.query.articles.findFirst({
      where: sql`${articles.id} = ${id} AND ${articles.deletedAt} IS NULL`,
      with: {
        author: true,
        comments: {
          limit: 3,
          where: ({ deletedAt }) => isNull(deletedAt),
        }
      }
    });
  }

  async deleteArticle(id: string) {
    const now = new Date();
    const result = await this.db.update(articles)
      .set({ deletedAt: now })
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }
  
  async getArticleAuthorId(id: string) {
    const result = await this.db.select({ authorId: articles.authorId })
      .from(articles)
      .where(and(
        eq(articles.id, id),
        isNull(articles.deletedAt)
      ));
    
    return result.length > 0 ? result[0].authorId : null;
  }

  async updateArticle(id: string, data: Partial<ArticleUpload>) {
    const result = await this.db.update(articles)
      .set({
        content: data.content,
        emoji: data.emoji,
        updatedAt: new Date(),
      })
      .where(and(
        eq(articles.id, id),
        isNull(articles.deletedAt)
      ))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }
}
