import { Injectable } from '@nestjs/common';
import { comments } from '@/database/schema';
import { CommentUpload } from '../dto';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import { InjectDrizzle } from '@/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { generateConsistentAnonymousName } from '../domain';
import { CommentWithRelations } from '../types/comment.type';
import { ArticleRepository } from './article.repository';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async createComment(
    articleId: string,
    authorId: string,
    authorNickname: string,
    data: CommentUpload,
    anonymousName: string | null,
  ) {
    const id = generateUuidV7();
    const { content } = data;

    const result = await this.db
      .insert(comments)
      .values({
        id,
        articleId,
        authorId,
        nickname: anonymousName ?? authorNickname,
        content,
      })
      .returning();

    return result[0];
  }

  async getCommentsByPostId(
    articleId: string,
  ): Promise<CommentWithRelations[]> {
    const results = await this.db.query.comments.findMany({
      where: ({ articleId: queryPostId, deletedAt }) =>
        and(eq(queryPostId, articleId), isNull(deletedAt)),
      orderBy: asc(comments.createdAt),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            profile: {
              with: {
                universityDetail: true,
                user: true,
              },
            },
          },
        },
      },
    });
    return results as CommentWithRelations[];
  }

  async updateComment(id: string, data: Partial<CommentUpload>) {
    const result = await this.db
      .update(comments)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async deleteComment(id: string) {
    const now = new Date();
    const result = await this.db
      .update(comments)
      .set({ deletedAt: now })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async getCommentAuthorId(id: string) {
    const result = await this.db
      .select({ authorId: comments.authorId })
      .from(comments)
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)));

    return result.length > 0 ? result[0].authorId : null;
  }

  async getRecentCommentByUser(userId: string, secondsAgo: number) {
    const timeThreshold = new Date(Date.now() - secondsAgo * 1000);

    const result = await this.db
      .select({
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(
        and(
          eq(comments.authorId, userId),
          isNull(comments.deletedAt),
          sql`${comments.createdAt} > ${timeThreshold}`,
        ),
      )
      .orderBy(desc(comments.createdAt))
      .limit(1)
      .execute();

    return result.length > 0 ? result[0] : null;
  }
}
