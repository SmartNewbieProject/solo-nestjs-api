import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { ArticleQueryOptions, ArticleRequestType } from "../types/article.types";
import { eq, SQL, and, sql, desc, isNull, or } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { Gender } from "@/types/enum";

const { articles, users, profiles, universityDetails, comments, likes } = schema;

export interface CommentResult {
  id: string;
  authorId: string;
  postId: string;
  parentId: string | null;
  content: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date | null;
  authorName: string;
  authorGender: Gender;
  authorAge: number;
  universityName: string;
  universityAuthentication: boolean;
  universityDepartment: string;
  universityGrade: string;
  universityStudentNumber: string;
  replies?: CommentResult[] | null;
}

export interface ArticleQueryResult {
  article: {
    id: string;
    title: string;
    content: string;
    anonymous: string | null;
    likeCount: number;
    readCount: number;
    createdAt: Date;
    updatedAt: Date | null;
  };
  author: {
    id: string;
    name: string;
    age: number;
    gender: Gender;
    nickname: string;
  };
  universityName: string;
  universityAuthentication: boolean;
  universityDepartment: string;
  universityGrade: string;
  universityStudentNumber: string;
  commentCount: number;
  comments: CommentResult[] | null;
  isLiked: boolean;
  categoryCode: ArticleRequestType;
}

export class ArticleQueryBuilder {
  private readonly db: NodePgDatabase<typeof schema>;
  private readonly options: ArticleQueryOptions;
  private query: PgSelect<any>;
  private categoryCode: ArticleRequestType;

  constructor(db: NodePgDatabase<typeof schema>, options: ArticleQueryOptions) {
    this.db = db;
    this.options = options;
  }

  private buildConditions(): SQL[] {
    const o = this.options;
    const conditions: SQL[] = [];

    if (o.categoryCode) {
      this.categoryCode = o.categoryCode;
      conditions.push(
        sql`${schema.articleCategory.code} = ${o.categoryCode}`,
      );
    }

    if (o.searchTerm) {
      conditions.push(
        sql`${articles.title} ILIKE ${`%${o.searchTerm}%`}`,
      );
    }

    if (!o.includedDeleted) {
      conditions.push(isNull(articles.deletedAt));
    }

    if (!o.includedBlinded) {
      conditions.push(isNull(articles.blindedAt));
    }

    if (o.articleId) {
      conditions.push(eq(articles.id, o.articleId));
    }

    return conditions;
  }

  private buildCommentsSubquery() {
    const o = this.options;
    // comment.limit이 없는 경우 모든 댓글을 불러오도록 수정
    // limit이 undefined인 경우 null로 설정하여 제한 없이 모든 댓글을 불러옴
    const commentLimit = o.comment?.limit !== undefined ? o.comment.limit : null;
    const includeReplies = o.comment?.reply || false;

    const parentCommentCondition = isNull(comments.parentId);

    // SQL 표현식을 사용하여 camelCase로 변환
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
    const commentsSubquery = this.buildCommentsSubquery();
    const isLikedSubquery = this.buildIsLikedSubquery();

    this.query = this.db.select({
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
    })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(universityDetails, eq(users.id, universityDetails.userId))
      .leftJoin(schema.articleCategory, and(
        eq(articles.categoryId, schema.articleCategory.id),
        eq(schema.articleCategory.code, this.categoryCode)
      ))
      .where(and(...conditions))
      .orderBy(desc(articles.createdAt))
      .$dynamic();

    if (o.limit) {
      this.query = this.query.limit(o.limit);
      if (o.page) {
        const offset = (o.page - 1) * o.limit;
        this.query = this.query.offset(offset);
      }
    }

    return this;
  }

  execute(): Promise<ArticleQueryResult[]> {
    return this.query.execute() as Promise<ArticleQueryResult[]>;
  }


  createMyLike(): PgSelect<any> {
    const o = this.options;

    if (!o.userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    const conditions = this.buildConditions();
    const commentsSubquery = this.buildCommentsSubquery();

    return this.db.select({
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
      isLiked: sql<boolean>`true`.as('is_liked'),
    })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(universityDetails, eq(users.id, universityDetails.userId))
      .leftJoin(schema.articleCategory, and(
        eq(articles.categoryId, schema.articleCategory.id),
        eq(schema.articleCategory.code, this.categoryCode)
      ))
      .innerJoin(likes, and(
        eq(likes.articleId, articles.id),
        eq(likes.userId, o.userId),
        eq(likes.up, true),
        isNull(likes.deletedAt)
      ))
      .where(and(...conditions))
      .orderBy(desc(articles.createdAt))
      .$dynamic();
  }
}
