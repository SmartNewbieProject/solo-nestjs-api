import { Injectable } from '@nestjs/common';
import { articles } from '@/database/schema';
import { ArticleUpload } from '../dto';
import { sql } from 'drizzle-orm';
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
        },
      },
      where: sql`${articles.deletedAt} IS NULL`,
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
        }
      }
    });
  }
}
