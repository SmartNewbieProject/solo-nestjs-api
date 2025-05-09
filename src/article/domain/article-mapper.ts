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
    const createdAt = result.article.createdAt;
    const updatedAt = result.article.updatedAt || result.article.createdAt;
    this.logger.debug(`createdAt: ${createdAt.toISOString()}, updatedAt: ${updatedAt.toISOString()}`);
    const createdAtFormatted = dayjs(createdAt).utc();
    const updatedAtFormatted = dayjs(updatedAt).utc();

    const createdAtString = createdAtFormatted.format('YYYY-MM-DDTHH:mm:ss.SSS');
    const updatedAtString = updatedAtFormatted.format('YYYY-MM-DDTHH:mm:ss.SSS');

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
      updatedAt: updatedAtString,
      isLiked: result.isLiked,
      createdAt: createdAtString,
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
    const createdAtDayjs = weekDateService.createDayjs(comment.createdAt).utc();
    const updatedAtDayjs = comment.updatedAt ?
      weekDateService.createDayjs(comment.updatedAt).utc() :
      createdAtDayjs;

    const createdAtString = createdAtDayjs.format('YYYY-MM-DDTHH:mm:ss.SSS');
    const updatedAtString = updatedAtDayjs.format('YYYY-MM-DDTHH:mm:ss.SSS');

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
      updatedAt: updatedAtString,
      createdAt: createdAtString
    };
  }

  private static getCategoryCode(_result: ArticleQueryResult): ArticleRequestType {
    return _result.categoryCode;
  }
}
