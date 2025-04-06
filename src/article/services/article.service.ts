import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { ArticleUpload } from '../dto';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async createArticle(userId: string, articleData: ArticleUpload) {
    return await this.articleRepository.createArticle(userId, articleData);
  }

  async getArticles(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const articles = await this.articleRepository.getArticles(limit, offset);
    
    return {
      items: articles,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: articles.length,
        hasNextPage: articles.length === limit,
        hasPreviousPage: page > 1
      }
    };
  }

  async getArticleById(id: string) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return article;
  }

  async deleteArticle(id: string, userId: string, isAdmin: boolean) {
    // 게시글 존재 여부 확인
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 작성자 본인 또는 관리자인지 확인
    const authorId = await this.articleRepository.getArticleAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('게시글 삭제 권한이 없습니다.');
    }

    // 게시글 삭제
    const deletedArticle = await this.articleRepository.deleteArticle(id);
    return deletedArticle;
  }
}
