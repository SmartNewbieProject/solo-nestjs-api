import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { ArticleQueryOptions, ArticleRequestType } from "../types/article.types";
import { eq, SQL, and, sql, desc, isNull } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { ArticleQueryResult } from "./article-query-builder";

const { articles, users, profiles, universityDetails, comments, likes, hotArticles } = schema;

export class HotArticleQueryBuilder {
  private readonly db: NodePgDatabase<typeof schema>;
  private readonly options: ArticleQueryOptions;
  private query: PgSelect<any>;

  constructor(db: NodePgDatabase<typeof schema>, options: ArticleQueryOptions) {
    this.db = db;
    this.options = options;
  }

  private buildConditions(): SQL[] {
    const o = this.options;
    const conditions: SQL[] = [];

    if (!o.includedDeleted) {
      conditions.push(isNull(hotArticles.deletedAt));
    }

    if (o.articleId) {
      conditions.push(eq(hotArticles.articleId, o.articleId));
    }

    return conditions;
  }

  private buildCommentsSubquery() {
    const o = this.options;
    const commentLimit = o.comment?.limit !== undefined ? o.comment.limit : null;
    const includeReplies = o.comment?.reply || false;

    const parentCommentCondition = isNull(comments.parentId);

    let commentsQuery = this.db.select({
      id: sql`${comments.id}`.as('id'),
      authorId: sql`${comments.authorId}`.as('authorId'),
      articleId: sql`${comments.articleId}`.as('articleId'),
      parentId: sql`${comments.parentId}`.as('parentId'),
      content: sql`${comments.content}`.as('content'),
      nickname: sql`${comments.nickname}`.as('nickname'),
      createdAt: sql`${comments.createdAt}`.as('createdAt'),
      updatedAt: sql`${comments.updatedAt}`.as('updatedAt'),
      authorName: sql`${users.name}`.as('authorName'),
      authorGender: sql`${profiles.gender}`.as('authorGender'),
      authorAge: sql`${profiles.age}`.as('authorAge'),
      universityName: sql`${universityDetails.universityName}`.as('universityName'),
      universityAuthentication: sql`${universityDetails.authentication}`.as('universityAuthentication'),
      universityDepartment: sql`${universityDetails.department}`.as('universityDepartment'),
      universityGrade: sql`${universityDetails.grade}`.as('universityGrade'),
      universityStudentNumber: sql`${universityDetails.studentNumber}`.as('universityStudentNumber'),
    })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(universityDetails, eq(users.id, universityDetails.userId))
      .where(and(
        eq(comments.articleId, articles.id),
        isNull(comments.deletedAt),
        isNull(comments.blindedAt),
        includeReplies ? sql`1=1` : parentCommentCondition
      ))
      .orderBy(desc(comments.createdAt))
      .$dynamic();

    if (commentLimit !== null && commentLimit > 0) {
      commentsQuery = commentsQuery.limit(commentLimit);
    }

    return commentsQuery;
  }

  private buildIsLikedSubquery() {
    const o = this.options;

    if (!o.userId) {
      return sql<boolean>`false`.as('is_liked');
    }

    return sql<boolean>`
      EXISTS (
        SELECT 1
        FROM ${likes}
        WHERE ${likes.articleId} = ${articles.id}
        AND ${likes.userId} = ${o.userId}
        AND ${likes.up} = true
        AND ${likes.deletedAt} IS NULL
      )
    `.as('is_liked');
  }

  create(): this {
    const o = this.options;
    const conditions = this.buildConditions();

    const hotArticleQuery = this.db
      .select({
        articleId: hotArticles.articleId,
      })
      .from(hotArticles)
      .where(and(...conditions))
      .orderBy(desc(hotArticles.createdAt))
      .$dynamic();

    if (o.limit) {
      this.query = hotArticleQuery.limit(o.limit);
      if (o.page) {
        const offset = (o.page - 1) * o.limit;
        this.query = hotArticleQuery.offset(offset);
      }
    } else {
      this.query = hotArticleQuery;
    }

    return this;
  }

  async execute(): Promise<ArticleQueryResult[]> {
    // 인기 게시글 ID 목록 조회
    const hotArticleIds = await this.query.execute();

    if (hotArticleIds.length === 0) {
      return [];
    }

    // 각 게시글 상세 정보 조회
    const articlePromises = hotArticleIds.map(async (item) => {
      const commentsSubquery = this.buildCommentsSubquery();
      const isLikedSubquery = this.buildIsLikedSubquery();

      const results = await this.db.select({
        article: {
          id: articles.id,
          title: articles.title,
          content: articles.content,
          anonymous: articles.anonymous,
          likeCount: articles.likeCount,
          readCount: articles.readCount,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
        },
        author: {
          id: users.id,
          name: users.name,
          age: profiles.age,
          gender: profiles.gender,
          nickname: profiles.name,
        },
        universityName: universityDetails.universityName,
        universityAuthentication: universityDetails.authentication,
        universityDepartment: universityDetails.department,
        universityGrade: universityDetails.grade,
        universityStudentNumber: universityDetails.studentNumber,
        commentCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${schema.comments} c
          WHERE c.article_id = ${articles.id}
          AND c.deleted_at IS NULL
        )`.as('commentCount'),
        comments: sql<any>`(
          SELECT json_agg(c)
          FROM (${commentsSubquery}) c
        )`.as('comments'),
        isLiked: isLikedSubquery,
        likeCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${schema.likes} l
          WHERE l.article_id = ${articles.id}
          AND l.up = true
          AND l.deleted_at IS NULL
        )`.as('likeCount'),
        categoryCode: sql<ArticleRequestType>`'hot'`.as('categoryCode'),
      })
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .leftJoin(universityDetails, eq(users.id, universityDetails.userId))
        .where(eq(articles.id, item.articleId))
        .execute();

      return results.length > 0 ? results[0] : null;
    });

    const articleResults = await Promise.all(articlePromises);
    return articleResults.filter(result => result !== null) as ArticleQueryResult[];
  }
}
