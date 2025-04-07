import { Injectable } from '@nestjs/common';
import { comments } from '@/database/schema';
import { CommentUpload } from '../dto';
import { eq, and, isNull } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import { InjectDrizzle } from '@/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { generateConsistentAnonymousName } from '../domain';
import { AuthorDetails } from '@/types/community';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createComment(postId: string, authorId: string, data: CommentUpload) {
    const id = generateUuidV7();
    const anonymous = data.anonymous
      ? generateConsistentAnonymousName(authorId)
      : null;

    const result = await this.db.insert(comments).values({
      id,
      postId,
      authorId,
      content: data.content,
      anonymous,
      emoji: data.emoji,
    }).returning();

    return result[0];
  }

  async getCommentsByPostId(postId: string) {
    return await this.db.select({
      id: comments.id,
      postId: comments.postId,
      content: comments.content,
      emoji: comments.emoji,
      anonymous: comments.anonymous,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: {
        id: schema.users.id,
        email: schema.users.email,
        name: schema.profiles.name,
      },
    })
    .from(comments)
    .leftJoin(schema.users, eq(comments.authorId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
    .where(and(
      eq(comments.postId, postId),
      isNull(comments.deletedAt),
    ))
    .orderBy(comments.createdAt);
  }

  async updateComment(id: string, data: Partial<CommentUpload>) {
    const result = await this.db.update(comments)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(and(
        eq(comments.id, id),
        isNull(comments.deletedAt)
      ))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async deleteComment(id: string) {
    const now = new Date();
    const result = await this.db.update(comments)
      .set({ deletedAt: now })
      .where(and(
        eq(comments.id, id),
        isNull(comments.deletedAt)
      ))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async getCommentAuthorId(id: string) {
    const result = await this.db.select({ authorId: comments.authorId })
      .from(comments)
      .where(and(
        eq(comments.id, id),
        isNull(comments.deletedAt)
      ));
    
    return result.length > 0 ? result[0].authorId : null;
  }
}
