import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommentRepository } from '../repository/comment.repository';
import type { CommentUpdate, CommentUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';
import ProfileRepository from '@/user/repository/profile.repository';
import type { CommentDetails, CommentWithRelations } from '../types/comment.type';
import { AuthenticationUser } from '@/types';
import { AnonymousNameService } from './anonymous-name.service';
import weekDateService from '@/matching/domain/date';
import { getUniversities, getDepartmentsByUniversity } from '@/auth/domain/university';
import { Gender } from '@/types/enum';

@Injectable()
export class CommentService {
  private readonly AI_USER_ID = 'ai-bot-user-id-permanent';
  private readonly GRADES = ['1학년', '2학년', '3학년', '4학년'];
  private readonly NAMES = [
    '민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서',
    '서연', '서윤', '지우', '서현', '민서', '하은', '지유', '예은', '소율', '지민'
  ];

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly articleRepository: ArticleRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly anonymousNameService: AnonymousNameService,
  ) { }


  async createComment(postId: string, user: AuthenticationUser, data: CommentUpload) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    await this.checkDuplicateComment(user.id, data);

    const profile = await this.profileRepository.getProfileSummary(user.id);
    const anonymousName = data.anonymous ? await this.anonymousNameService.generateAnonymousName(user.name) : null;
    return await this.commentRepository.createComment(postId, user.id, profile.name, data, anonymousName);
  }

  private async checkDuplicateComment(userId: string, data: CommentUpload) {
    const recentComment = await this.commentRepository.getRecentCommentByUser(userId, 5);

    if (recentComment && recentComment.content === data.content) {
      throw new BadRequestException('동일한 댓글을 너무 빠르게 작성할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  }


  async getCommentsByPostId(postId: string): Promise<CommentDetails[]> {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const results = await this.commentRepository.getCommentsByPostId(postId);
    return results.map(comment => this.processComment(comment));
  }


  async updateComment(id: string, userId: string, isAdmin: boolean, data: CommentUpdate) {
    const comment = await this.commentRepository.getCommentAuthorId(id);
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const authorId = await this.commentRepository.getCommentAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('댓글 수정 권한이 없습니다.');
    }

    return await this.commentRepository.updateComment(id, data);
  }

  async deleteComment(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.commentRepository.getCommentAuthorId(id);
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    const authorId = await this.commentRepository.getCommentAuthorId(id);
    if (!isAdmin && authorId !== userId) {
      throw new ForbiddenException('댓글 삭제 권한이 없습니다.');
    }

    return await this.commentRepository.deleteComment(id);
  }

  private processComment(comment: CommentWithRelations): CommentDetails {
    // AI 사용자인 경우 가상 정보 생성
    const author = comment.author.id === this.AI_USER_ID
      ? this.generateAiCommentAuthor(comment)
      : {
          id: comment.author.id,
          age: comment.author.profile.age,
          name: comment.nickname || comment.author.name,
          gender: comment.author.profile.gender,
          universityDetails: {
            name: comment.author.profile.universityDetail?.universityName || '',
            authentication: comment.author.profile.universityDetail?.authentication || false,
            department: comment.author.profile.universityDetail?.department || '',
            grade: comment.author.profile.universityDetail?.grade || '',
            studentNumber: comment.author.profile.universityDetail?.studentNumber || '',
          }
        };

    return {
      id: comment.id,
      content: comment.content,
      author,
      updatedAt: weekDateService.createDayjs(comment.updatedAt || comment.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      createdAt: weekDateService.createDayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  private generateAiCommentAuthor(comment: CommentWithRelations) {
    const seed = this.generateSeedFromString(comment.id);
    const { university, department, grade, age, gender } = this.generateConsistentProfile(seed);

    return {
      id: comment.author.id,
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

  private generateSeedFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private generateConsistentProfile(seed: number) {
    const universities = getUniversities();
    const universityIndex = seed % universities.length;
    const university = universities[universityIndex];

    const departments = getDepartmentsByUniversity(university);
    const departmentIndex = Math.floor(seed / universities.length) % Math.max(departments.length, 1);
    const department = departments.length > 0 ? departments[departmentIndex] : '자율전공학부';

    const gradeIndex = Math.floor(seed / (universities.length * Math.max(departments.length, 1))) % this.GRADES.length;
    const grade = this.GRADES[gradeIndex];

    const age = 19 + (seed % 4);
    const gender = (seed % 2 === 0) ? Gender.MALE : Gender.FEMALE;

    return { university, department, grade, age, gender };
  }

  private generateConsistentRandomName(seed: number): string {
    return this.NAMES[seed % this.NAMES.length];
  }

  private generateConsistentStudentNumber(seed: number): string {
    const year = 19 + (seed % 6);
    const number = 1000 + (seed % 9000);
    return `${year}${number}`;
  }
}
