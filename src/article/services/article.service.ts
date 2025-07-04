import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { ArticleUpload } from '../dto';
import { LikeRepository } from '../repository/like.repository';
import { PaginatedResponse } from '@/types/common';
import { ArticleDetails, ArticleRequestType } from '../types/article.types';
import { paginationUtils } from '@/common/helper';
import { ArticleViewService } from './article-view.service';
import { ViewCountAggregator } from './view-count-aggregator.service';
import { AuthenticationUser } from '@/types';
import { AnonymousNameService } from './anonymous-name.service';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly likeRepository: LikeRepository,
    private readonly articleViewService: ArticleViewService,
    private readonly viewCountAggregator: ViewCountAggregator,
    private readonly anonymousNameService: AnonymousNameService,
  ) {}

  async getArticleCategories() {
    const categories = await this.articleRepository.getArticleCategories();
    categories.splice(1, 0, {
      code: 'hot',
      displayName: '인기',
      emojiUrl:
        'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/fire.png',
    });

    return categories;
  }

  async createArticle(user: AuthenticationUser, articleData: ArticleUpload) {
    await this.checkDuplicateRequest(user.id, articleData);

    const anonymousName = articleData.anonymous
      ? await this.anonymousNameService.generateAnonymousName(user.name)
      : null;
    await this.articleRepository.createArticle(
      user.id,
      articleData,
      anonymousName,
    );
  }

  private async checkDuplicateRequest(
    userId: string,
    articleData: ArticleUpload,
  ) {
    const recentArticle = await this.articleRepository.getRecentArticleByUser(
      userId,
      10,
    );

    if (
      recentArticle &&
      recentArticle.title === articleData.title &&
      recentArticle.content === articleData.content
    ) {
      throw new BadRequestException(
        '동일한 게시글을 너무 빠르게 작성할 수 없습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  async getArticles(
    categoryCode: ArticleRequestType,
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<PaginatedResponse<ArticleDetails>> {
    let articles: ArticleDetails[] = [];
    let totalCount: number = 0;

    const reportIds = userId
      ? await this.articleRepository.getReportIds(userId)
      : [];

    if (categoryCode === ArticleRequestType.HOT) {
      articles = await this.articleRepository.getHotArticles({
        page,
        limit,
        comment: { limit: 3 },
        userId,
      });
      const { count } = await this.articleRepository.getHotArticlesTotalCount();
      totalCount = Number(count);
    } else {
      articles = await this.articleRepository.executeArticleQuery({
        categoryCode,
        page,
        limit,
        comment: { limit: 3 },
        authorId: userId,
        userId,
        exceptArticleIds: reportIds,
      });
      const { count } =
        await this.articleRepository.getArticleTotalCount(categoryCode);
      totalCount = Number(count);
    }

    this.logger.debug(
      `게시글 조회 완료: ${totalCount}개의 게시글을 조회했습니다.`,
    );

    const aggregatedArticles =
      await this.viewCountAggregator.aggregateList(articles);

    return {
      items: aggregatedArticles,
      meta: paginationUtils.createMetdata(page, limit, totalCount),
    };
  }

  async getArticleById(id: string, userId?: string): Promise<ArticleDetails> {
    const article = await this.articleRepository.getArticleById(id, userId);
    await this.articleViewService.incrementViewCount(id, userId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return await this.viewCountAggregator.aggregate(article);
  }

  async updateArticle(
    id: string,
    userId: string,
    isAdmin: boolean,
    data: Partial<ArticleUpload>,
  ) {
    const article = await this.articleRepository.getArticleById(id, userId);
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
    const article = await this.articleRepository.getArticleById(id, userId);
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
