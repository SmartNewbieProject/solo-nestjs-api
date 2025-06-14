import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import type { CommentUpdate, CommentUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';
import ProfileRepository from '@/user/repository/profile.repository';
import type { CommentDetails, CommentWithRelations } from '../types/comment.type';
import { AuthenticationUser } from '@/types';
import { AnonymousNameService } from './anonymous-name.service';
import weekDateService from '@/matching/domain/date';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly anonymousNameService: AnonymousNameService,
  ) { }


  async createComment(postId: string, user: AuthenticationUser, data: CommentUpload) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.checkDuplicateComment(user.id, data);

    const profile = await this.profileRepository.getProfileSummary(user.id);
    const anonymousName = data.anonymous ? await this.anonymousNameService.generateAnonymousName(user.name) : null;
    return await this.commentRepository.createComment(postId, user.id, profile.name, data, anonymousName);
  }

  private async checkDuplicateComment(userId: string, data: CommentUpload) {
    const recentComment = await this.commentRepository.getRecentCommentByUser(userId, 5);

    if (recentComment && recentComment.content === data.content) {
      throw new BadRequestException('동일한 댓글을 너무 빠르게 작성할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
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
      updatedAt: weekDateService.createDayjs(comment.updatedAt || comment.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      createdAt: weekDateService.createDayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    };
  }
}
