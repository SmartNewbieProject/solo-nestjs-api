import { ArticleDetails, ArticleRequestType, AuthorDetails } from '../types/article.types';
import { ArticleQueryResult, CommentResult } from './article-query-builder';
import { CommentDetails } from '../types/comment.type';
import { UniversityDetail } from '@/types/user';
import { Logger } from '@nestjs/common';
import { dayUtils } from '@/common/helper/day';
import weekDateService from '@/matching/domain/date';
import * as dayjs from 'dayjs';

export class ArticleMapper {
  private static logger = new Logger(ArticleMapper.name);

  static toArticleDetails(result: ArticleQueryResult): ArticleDetails {

    return {
      id: result.article.id,
      title: result.article.title,
      content: result.article.content,
      comments: result.comments ? result.comments.map(comment => this.toCommentDetails(comment)) : [],
      category: this.getCategoryCode(result),
      author: this.toAuthorDetails(result),
      likeCount: Number(result.likeCount),
      commentCount: Number(result.commentCount),
      readCount: result.article.readCount,
      updatedAt: result.article.updatedAt || result.article.createdAt,
      isLiked: result.isLiked,
      createdAt: result.article.createdAt,
    };
  }

  static toArticleDetailsList(results: ArticleQueryResult[]): ArticleDetails[] {
    return results.map(result => this.toArticleDetails(result));
  }

  private static toAuthorDetails(result: ArticleQueryResult): AuthorDetails {
    return {
      id: result.author.id,
      name: result.article.anonymous ? result.article.anonymous : result.author.name,
      age: result.author.age,
      gender: result.author.gender,
      universityDetails: this.toUniversityDetails(result),
    };
  }

  private static toUniversityDetails(result: ArticleQueryResult): UniversityDetail {
    return {
      name: result.universityName,
      authentication: result.universityAuthentication,
      department: result.universityDepartment,
      grade: result.universityGrade,
      studentNumber: result.universityStudentNumber,
    };
  }

  static toCommentDetails(comment: CommentResult): CommentDetails {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.authorId,
        name: comment.nickname || comment.authorName,
        age: comment.authorAge,
        gender: comment.authorGender,
        universityDetails: {
          name: comment.universityName,
          authentication: comment.universityAuthentication,
          department: comment.universityDepartment,
          grade: comment.universityGrade,
          studentNumber: comment.universityStudentNumber,
        },
      },
      updatedAt: comment.updatedAt || comment.createdAt,
      createdAt: comment.createdAt,
    };
  }

  private static getCategoryCode(_result: ArticleQueryResult): ArticleRequestType {
    return _result.categoryCode;
  }
}
