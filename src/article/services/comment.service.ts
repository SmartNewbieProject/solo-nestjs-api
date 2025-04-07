import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import { CommentUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';
import { AuthorDetails } from '@/types/community';
import AnonymityHandler from '../domain/anonymous';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}


  async createComment(postId: string, userId: string, data: CommentUpload) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return await this.commentRepository.createComment(postId, userId, data);
  }


  async getCommentsByPostId(postId: string) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const comments = await this.commentRepository.getCommentsByPostId(postId);
    return comments.map(comment => ({
      ...comment,
      author: AnonymityHandler.comment(comment.anonymous, {
        id: comment.author.id,
        name: comment.author.name,
      } as AuthorDetails),
    }));
  }


  async updateComment(id: string, userId: string, isAdmin: boolean, data: Partial<CommentUpload>) {
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
}
