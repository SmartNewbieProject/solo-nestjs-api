import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { ArticleUpload } from '../dto';
import { LikeRepository } from '../repository/like.repository';
import { PaginatedResponse } from '@/types/common';
import { ArticleDetails, ArticleRequestType, ArticleWithRelations } from '../types/article.types';
import { UniversityDetail } from '@/types/user';
import { paginationUtils } from '@/common/helper';
import { Gender } from '@/types/enum';
import { UniversityDetailModel } from '@/types/database';

@Injectable()
export class ArticleService {
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

  async getArticles(categoryId: string, page: number = 1, limit: number = 10, userId: string): Promise<PaginatedResponse<any>> {
    const offset = paginationUtils.getOffset(page, limit);
    const articles = await this.articleRepository.getArticles(categoryId, limit, offset);

    const articleIds = articles.map(article => article.id);
    const likedMap = await this.likeRepository.hasUserLikedArticles(userId, articleIds);
    const articleProcesseds = this.processArticles(articles);

    const results = articleProcesseds.map(article => ({
      ...article,
      isLiked: !!likedMap[article.id]
    }));

    return {
      items: results,
      meta: paginationUtils.createMetdata(page, limit, articles.length),
    };
  }

  async getArticleById(id: string, userId: string) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const isLiked = await this.likeRepository.hasUserLikedArticle(userId, id);

    const processedArticle = {
      id: article.id,
      author: {
        id: article.author.id,
        name: article.anonymous ? article.anonymous : article.author.name,
        gender: article.author.profile.gender as Gender,
        universityDetails: this.university(article.author?.profile?.universityDetail as UniversityDetailModel),
      },
      updatedAt: article.updatedAt || article.createdAt,
      category: article.articleCategory.code as ArticleRequestType,
      content: article.content,
      likeCount: article.likes.length,
      readCount: article.readCount,
      comments: article.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.authorId,
          name: comment.nickname || '익명',
          universityDetails: this.university(comment.author?.profile?.universityDetail as UniversityDetailModel),
        },
        updatedAt: comment.updatedAt || comment.createdAt,
      })),
      isLiked,
    };

    return processedArticle;
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

  processArticles(articles: ArticleWithRelations[]): ArticleDetails[] {
    return articles.map(article => ({
      id: article.id,
      author: {
        id: article.author.id,
        name: article.anonymous ? article.anonymous : article.author.name,
        gender: article.author.profile.gender as Gender,
        universityDetails: this.university(article.author?.profile?.universityDetail as UniversityDetailModel),
      },
      updatedAt: article.updatedAt || article.createdAt,
      isLiked: false,
      category: article.articleCategory.code as ArticleRequestType,
      content: article.content,
      likeCount: article.likes.length,
      readCount: article.readCount,
      comments: article.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.authorId,
          name: comment.nickname,
          universityDetails: this.university(comment.author.profile?.universityDetail as UniversityDetailModel),
        },
      })),
    }));
  }

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
