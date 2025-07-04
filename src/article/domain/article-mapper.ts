import {
  ArticleDetails,
  ArticleRequestType,
  AuthorDetails,
} from '../types/article.types';
import { ArticleQueryResult, CommentResult } from './article-query-builder';
import { CommentDetails } from '../types/comment.type';
import { UniversityDetail } from '@/types/user';
import { Logger } from '@nestjs/common';
import weekDateService from '@/matching/domain/date';
import * as dayjs from 'dayjs';
import {
  getUniversities,
  getDepartmentsByUniversity,
} from '@/auth/domain/university';
import { Gender } from '@/types/enum';

export class ArticleMapper {
  private static readonly logger = new Logger(ArticleMapper.name);
  private static readonly AI_USER_ID = 'ai-bot-user-id-permanent';
  private static readonly GRADES = ['1학년', '2학년', '3학년', '4학년'];
  private static readonly NAMES = [
    '민준',
    '서준',
    '도윤',
    '예준',
    '시우',
    '하준',
    '주원',
    '지호',
    '지후',
    '준서',
    '서연',
    '서윤',
    '지우',
    '서현',
    '민서',
    '하은',
    '지유',
    '예은',
    '소율',
    '지민',
  ];

  static toArticleDetails(result: ArticleQueryResult): ArticleDetails {
    const updatedAt = result.article.updatedAt || result.article.createdAt;

    return {
      id: result.article.id,
      title: result.article.title,
      content: result.article.content,
      comments: result.comments
        ? result.comments.map((comment) => this.toCommentDetails(comment))
        : [],
      category: this.getCategoryCode(result),
      author: this.toAuthorDetails(result),
      likeCount: Number(result.likeCount),
      commentCount: Number(result.commentCount),
      readCount: result.article.readCount,
      updatedAt: weekDateService
        .createDayjs(updatedAt)
        .format('YYYY-MM-DD HH:mm:ss'),
      isLiked: result.isLiked,
      createdAt: weekDateService
        .createDayjs(result.article.createdAt)
        .format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  static toArticleDetailsList(results: ArticleQueryResult[]): ArticleDetails[] {
    return results
      .map((result) => this.toArticleDetails(result))
      .map((result) => ({
        ...result,
        createdAt: dayjs(result.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs(result.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        comments: result.comments.map((comment) => ({
          ...comment,
          createdAt: dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs(comment.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        })),
      }));
  }

  private static toAuthorDetails(result: ArticleQueryResult): AuthorDetails {
    if (result.author.id === this.AI_USER_ID) {
      return this.generateAiAuthorDetails(result);
    }

    return {
      id: result.author.id,
      name: result.article.anonymous
        ? result.article.anonymous
        : result.author.name,
      age: result.author.age,
      gender: result.author.gender,
      universityDetails: this.toUniversityDetails(result),
    };
  }

  private static toUniversityDetails(
    result: ArticleQueryResult,
  ): UniversityDetail {
    return {
      name: result.universityName,
      authentication: result.universityAuthentication,
      department: result.universityDepartment,
      grade: result.universityGrade,
      studentNumber: result.universityStudentNumber,
    };
  }

  static toCommentDetails(comment: CommentResult): CommentDetails {
    const author =
      comment.authorId === this.AI_USER_ID
        ? this.generateAiCommentAuthorDetails(comment)
        : {
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
          };

    return {
      id: comment.id,
      content: comment.content,
      author,
      updatedAt: comment.updatedAt || comment.createdAt,
      createdAt: comment.createdAt,
    };
  }

  private static getCategoryCode(
    _result: ArticleQueryResult,
  ): ArticleRequestType {
    return _result.categoryCode;
  }

  private static generateAiAuthorDetails(
    result: ArticleQueryResult,
  ): AuthorDetails {
    const seed = this.generateSeedFromString(result.article.id);
    const { university, department, grade, age, gender } =
      this.generateConsistentProfile(seed);

    return {
      id: result.author.id,
      name: result.article.anonymous || this.generateConsistentRandomName(seed),
      age,
      gender,
      universityDetails: {
        name: university,
        authentication: true,
        department,
        grade,
        studentNumber: this.generateConsistentStudentNumber(seed),
      },
    };
  }

  private static generateRandomName(): string {
    return this.NAMES[Math.floor(Math.random() * this.NAMES.length)];
  }

  private static generateRandomStudentNumber(): string {
    const year = Math.floor(Math.random() * 6) + 19;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${year}${number}`;
  }

  private static generateSeedFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private static generateConsistentRandomName(seed: number): string {
    return this.NAMES[seed % this.NAMES.length];
  }

  private static generateConsistentStudentNumber(seed: number): string {
    const year = 19 + (seed % 6);
    const number = 1000 + (seed % 9000);
    return `${year}${number}`;
  }

  private static generateConsistentProfile(seed: number) {
    const universities = getUniversities();
    const universityIndex = seed % universities.length;
    const university = universities[universityIndex];

    const departments = getDepartmentsByUniversity(university);
    const departmentIndex =
      Math.floor(seed / universities.length) % Math.max(departments.length, 1);
    const department =
      departments.length > 0 ? departments[departmentIndex] : '자율전공학부';

    const gradeIndex =
      Math.floor(
        seed / (universities.length * Math.max(departments.length, 1)),
      ) % this.GRADES.length;
    const grade = this.GRADES[gradeIndex];

    const age = 19 + (seed % 4);
    const gender = seed % 2 === 0 ? Gender.MALE : Gender.FEMALE;

    return { university, department, grade, age, gender };
  }

  private static generateAiCommentAuthorDetails(comment: CommentResult): any {
    // 댓글 ID 기반으로 일관된 학교 정보 생성 (조회할 때마다 동일)
    const seed = this.generateSeedFromString(comment.id);
    const { university, department, grade, age, gender } =
      this.generateConsistentProfile(seed);

    return {
      id: comment.authorId,
      name: comment.nickname || this.generateConsistentRandomName(seed),
      age,
      gender,
      universityDetails: {
        name: university,
        authentication: true,
        department,
        grade,
        studentNumber: this.generateConsistentStudentNumber(seed),
      },
    };
  }
}
