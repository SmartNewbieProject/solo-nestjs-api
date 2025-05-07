import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { articles } from '@/database/schema';
import { ArticleUpload } from '../dto';
import { sql, eq, and, isNull, desc, count, SQL } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import {
  ArticleDetails,
  ArticleQueryOptions,
  ArticleRequestType,
  ArticleWithRelations,
} from '../types/article.types';

import { InjectDrizzle } from '@/common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { generateAnonymousName } from '../domain';
import { CommentWithRelations } from '../types/comment.type';
import { PgSelect } from 'drizzle-orm/pg-core';
import {
  ArticleQueryBuilder,
  ArticleQueryResult,
} from '../domain/article-query-builder';
import { HotArticleQueryBuilder } from '../domain/hot-article-query-builder';
import { ArticleMapper } from '../domain/article-mapper';

const { comments, likes, universityDetails, profiles, users, hotArticles } =
  schema;

@Injectable()
export class ArticleRepository {
  private logger = new Logger(ArticleRepository.name);

  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  getArticleCategories() {
    return this.db.query.articleCategory.findMany({
      columns: {
        displayName: true,
        emojiUrl: true,
        code: true,
      },
    });
  }

  async createArticle(authorId: string, articleData: ArticleUpload) {
    const category = await this.db.query.articleCategory.findFirst({
      where: eq(schema.articleCategory.code, articleData.type),
    });

    if (!category) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    const result = await this.db
      .insert(articles)
      .values({
        id: generateUuidV7(),
        title: articleData.title,
        authorId,
        categoryId: category.id,
        content: articleData.content,
        anonymous: articleData.anonymous ? generateAnonymousName() : null,
        likeCount: 0,
        readCount: 0,
        blindedAt: null,
      })
      .returning();

    return result[0];
  }

  async getArticleTotalCount(categoryCode: ArticleRequestType) {
    if (categoryCode === ArticleRequestType.HOT) {
      return this.getHotArticlesTotalCount();
    }

    const category = await this.db.query.articleCategory.findFirst({
      where: eq(schema.articleCategory.code, categoryCode),
    });

    if (!category) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    const results = await this.db
      .select({ count: count() })
      .from(articles)
      .where(
        and(
          eq(schema.articles.categoryId, category.id),
          isNull(schema.articles.deletedAt),
          isNull(schema.articles.blindedAt),
        ),
      )
      .execute();

    return results[0];
  }

  async executeArticleQuery(
    options: ArticleQueryOptions,
  ): Promise<ArticleDetails[]> {
    const results = await new ArticleQueryBuilder(this.db, options)
      .create()
      .execute();

    const articleDetails = ArticleMapper.toArticleDetailsList(results);

    this.logger.debug(`${results.length}개의 게시글을 조회했습니다.`);
    return articleDetails;
  }

  async getArticleById(
    id: string,
    userId?: string,
  ): Promise<ArticleDetails | null> {
    const results = await new ArticleQueryBuilder(this.db, {
      articleId: id,
      userId,
    })
      .create()
      .execute();

    if (results.length === 0) return null;

    return ArticleMapper.toArticleDetails(results[0]);
  }

  async deleteArticle(id: string) {
    const now = new Date();
    const result = await this.db
      .update(articles)
      .set({ deletedAt: now })
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  deleteHotArticle(id: string) {
    return this.db.delete(hotArticles).where(eq(hotArticles.articleId, id));
  }

  async getArticleAuthorId(id: string) {
    const result = await this.db
      .select({ authorId: articles.authorId })
      .from(articles)
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)));

    return result.length > 0 ? result[0].authorId : null;
  }

  async updateArticle(id: string, data: Partial<ArticleUpload>) {
    const result = await this.db
      .update(articles)
      .set({
        content: data.content,
        title: data.title,
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async getHotArticles(
    options: ArticleQueryOptions,
  ): Promise<ArticleDetails[]> {
    this.logger.debug('인기 게시글 조회 시작');

    const results = await new HotArticleQueryBuilder(this.db, options)
      .create()
      .execute();

    const articleDetails = ArticleMapper.toArticleDetailsList(results);

    this.logger.debug(
      `${articleDetails.length}개의 인기 게시글을 조회했습니다.`,
    );
    return articleDetails;
  }

  async getLatestSimpleHotArticles() {
    await this.db
      .select({
        id: articles.id,
        title: articles.title,
      })
      .from(hotArticles)
      .leftJoin(articles, eq(hotArticles.articleId, articles.id))
      .where(isNull(hotArticles.deletedAt))
      .orderBy(desc(hotArticles.createdAt))
      .execute();
  }

  async getHotArticlesTotalCount() {
    const result = await this.db
      .select({ count: count() })
      .from(hotArticles)
      .where(isNull(hotArticles.deletedAt))
      .limit(5)
      .execute();

    return result[0];
  }
}
