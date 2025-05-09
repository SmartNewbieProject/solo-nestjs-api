import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import type { CommentUpdate, CommentUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';
import ProfileRepository from '@/user/repository/profile.repository';
import type { CommentDetails, CommentWithRelations } from '../types/comment.type';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly profileRepository: ProfileRepository,
  ) { }


  async createComment(postId: string, userId: string, data: CommentUpload) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const profile = await this.profileRepository.getProfileSummary(userId);

    return await this.commentRepository.createComment(postId, userId, profile.name, data);
  }


  async getCommentsByPostId(postId: string): Promise<CommentDetails[]> {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const results = await this.commentRepository.getCommentsByPostId(postId);
    return results.map(this.processComment);
  }


  async updateComment(id: string, userId: string, isAdmin: boolean, data: CommentUpdate) {
    const comment = await this.commentRepository.getCommentAuthorId(id);
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const authorId = await this.commentRepository.getCommentAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('댓글 수정 권한이 없습니다.');
    }

    return await this.commentRepository.updateComment(id, data);
  }

  async deleteComment(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.commentRepository.getCommentAuthorId(id);
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const authorId = await this.commentRepository.getCommentAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('댓글 삭제 권한이 없습니다.');
    }

    return await this.commentRepository.deleteComment(id);
  }

  private processComment(comment: CommentWithRelations): CommentDetails {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        age: comment.author.profile.age,
        name: comment.nickname || comment.author.name,
        gender: comment.author.profile.gender,
        universityDetails: {
          name: comment.author.profile.universityDetail?.universityName || '',
          authentication: comment.author.profile.universityDetail?.authentication || false,
          department: comment.author.profile.universityDetail?.department || '',
          grade: comment.author.profile.universityDetail?.grade || '',
          studentNumber: comment.author.profile.universityDetail?.studentNumber || '',
        }
      },
      updatedAt: comment.updatedAt || comment.createdAt,
      createdAt: comment.createdAt,
    };
  }
}
