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

  async updateArticle(id: string, userId: string, isAdmin: boolean, data: Partial<ArticleUpload>) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const authorId = await this.articleRepository.getArticleAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('게시글 수정 권한이 없습니다.');
    }

    const updatedArticle = await this.articleRepository.updateArticle(id, data);
    return updatedArticle;
  }

  async deleteArticle(id: string, userId: string, isAdmin: boolean) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const authorId = await this.articleRepository.getArticleAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('게시글 삭제 권한이 없습니다.');
    }

    const deletedArticle = await this.articleRepository.deleteArticle(id);
    return deletedArticle;
  }
}
