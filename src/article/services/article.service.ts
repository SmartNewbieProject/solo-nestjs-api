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
    return await this.articleRepository.getArticleCategories();
  }

  async createArticle(userId: string, articleData: ArticleUpload) {
    await this.articleRepository.createArticle(userId, articleData);
  }

  async getArticles(categoryCode: ArticleRequestType, page: number = 1, limit: number = 10, userId: string): Promise<PaginatedResponse<ArticleDetails>> {
    const articles = await this.articleRepository.executeArticleQuery({
      categoryCode,
      page,
      limit,
      comment: { limit: 3 },
      authorId: userId,
      userId,
    });

    const { count: totalCategoryArticleCount } = await this.articleRepository.getArticleTotalCount(categoryCode);
    this.logger.debug(`게시글 조회 완료: ${totalCategoryArticleCount}개의 게시글을 조회했습니다.`);

    return {
      items: articles,
      meta: paginationUtils.createMetdata(page, limit, totalCategoryArticleCount),
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
    return deletedArticle;
  }

  async updateLikeCount(id: string, userId: string) {
    await this.likeRepository.like(userId, id);
  }

  /**
   * 대학 정보를 변환합니다.
   * @param universityDetails 대학 정보 모델
   * @returns 변환된 대학 정보
   */

  private university(universityDetails?: UniversityDetailModel): UniversityDetail {
    if (!universityDetails) return {
      name: '익명대학교',
      authentication: false,
      department: '익명',
      grade: '1학년',
      studentNumber: '10학번',
    }

    return {
      name: universityDetails.universityName,
      authentication: universityDetails.authentication,
      department: universityDetails.department,
      grade: universityDetails.grade,
      studentNumber: universityDetails.studentNumber,
    };
  }

}
