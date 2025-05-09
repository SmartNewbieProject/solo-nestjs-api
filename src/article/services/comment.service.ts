import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { CommentUpdate, CommentUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';
import ProfileRepository from '@/user/repository/profile.repository';
import { CommentDetails, CommentWithRelations } from '../types/comment.type';
import { dayUtils } from '@/common/helper/day';

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
    // 날짜를 문자열로 변환하여 'Z' 표기가 없는 형태로 반환
    const createdAt = comment.createdAt;
    const updatedAt = comment?.updatedAt || comment.createdAt;

    const createdAtString = dayUtils.create(createdAt).format('YYYY-MM-DDTHH:mm:ss.SSS');
    const updatedAtString = dayUtils.create(updatedAt).format('YYYY-MM-DDTHH:mm:ss.SSS');

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
      updatedAt: updatedAtString,
      createdAt: createdAtString,
    };
  }
}
