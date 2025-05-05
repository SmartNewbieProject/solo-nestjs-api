import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { ArticleUpload } from '../dto';
import { LikeRepository } from '../repository/like.repository';
import { PaginatedResponse } from '@/types/common';
import { ArticleDetails, ArticleRequestType } from '../types/article.types';
import { UniversityDetail } from '@/types/user';
import { paginationUtils } from '@/common/helper';
import { Gender } from '@/types/enum';
import { UniversityDetailModel } from '@/types/database';
import { ArticleMapper } from '../domain/article-mapper';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly likeRepository: LikeRepository
  ) { }

  async getArticleCategories() {
    const categories = await this.articleRepository.getArticleCategories();
    categories.splice(1, 0, {
      code: 'hot',
      displayName: '인기',
      emojiUrl: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/fire.png',
    });

    return categories;
  }

  async createArticle(userId: string, articleData: ArticleUpload) {
    await this.articleRepository.createArticle(userId, articleData);
  }

  async getArticles(categoryCode: ArticleRequestType, page: number = 1, limit: number = 10, userId: string): Promise<PaginatedResponse<ArticleDetails>> {
    let articles: ArticleDetails[] = [];
    let totalCount: number = 0;

    if (categoryCode === ArticleRequestType.HOT) {
      articles = await this.articleRepository.getHotArticles({
        page,
        limit,
        comment: { limit: 3 },
        userId,
      });
      const { count } = await this.articleRepository.getHotArticlesTotalCount();
      totalCount = Number(count);
    }
    else {
      articles = await this.articleRepository.executeArticleQuery({
        categoryCode,
        page,
        limit,
        comment: { limit: 3 },
        authorId: userId,
        userId,
      });
      const { count } = await this.articleRepository.getArticleTotalCount(categoryCode);
      totalCount = Number(count);
    }

    this.logger.debug(`게시글 조회 완료: ${totalCount}개의 게시글을 조회했습니다.`);

    return {
      items: articles,
      meta: paginationUtils.createMetdata(page, limit, totalCount),
    };
  }

  async getArticleById(id: string, userId: string): Promise<ArticleDetails> {
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
    await this.articleRepository.deleteHotArticle(id);
    return deletedArticle;
  }

  async updateLikeCount(id: string, userId: string) {
    await this.likeRepository.like(userId, id);
  }

  async getLatestHotArticles() {
    return await this.articleRepository.getLatestSimpleHotArticles();
  }

}
