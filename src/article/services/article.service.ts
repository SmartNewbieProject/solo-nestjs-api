import { Injectable, NotFoundException } from '@nestjs/common';
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
        totalItems: articles.length, // 실제로는 총 개수를 조회하는 쿼리가 필요합니다
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
}
