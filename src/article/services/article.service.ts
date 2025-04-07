import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { ArticleUpload, LikeArticle } from '../dto';
import { LikeRepository } from '../repository/like.repository';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly likeRepository: LikeRepository
  ) {}

  async createArticle(userId: string, articleData: ArticleUpload) {
    return await this.articleRepository.createArticle(userId, articleData);
  }

  async getArticles(page: number = 1, limit: number = 10, userId: string) {
    const offset = (page - 1) * limit;
    const articles = await this.articleRepository.getArticles(limit, offset);
    
    const articleIds = articles.map(article => article.id);
    const likedMap = await this.likeRepository.hasUserLikedArticles(userId, articleIds);
    const articlesWithLikedInfo = articles.map(article => ({
      ...article,
      author: {
        id: article.author.id,
        name: article.anonymous ? article.anonymous : article.author.name,
      },
      comments: article.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.authorId,
          name: comment.nickname,
        }
      })),
      isLiked: !!likedMap[article.id]
    }));
      
      return {
        items: articlesWithLikedInfo,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: articles.length,
          hasNextPage: articles.length === limit,
          hasPreviousPage: page > 1
        }
      };
  }

  async getArticleById(id: string, userId: string) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    
    const isLiked = await this.likeRepository.hasUserLikedArticle(userId, id);
    return { ...article, isLiked };
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

  async updateLikeCount(id: string, userId: string, likeData: LikeArticle) {
    const article = await this.articleRepository.getArticleById(id);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const updatedArticle = await this.articleRepository.updateLikeCount(id, likeData.like);
    return updatedArticle;
  }
}
