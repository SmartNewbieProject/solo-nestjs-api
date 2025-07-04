import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ArticleRepository } from '../repository/article.repository';
import { CommentRepository } from '../repository/comment.repository';
import { AiProfileService } from './ai-profile.service';
import { ArticleUpload, CommentUpload } from '../dto';
import { AuthenticationUser } from '@/types';

@Injectable()
export class AiContentService {
  private readonly logger = new Logger(AiContentService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly commentRepository: CommentRepository,
    private readonly aiProfileService: AiProfileService,
  ) {}

  /**
   * AI가 게시글 작성
   */
  async createAiArticle(
    aiUser: AuthenticationUser,
    articleData: ArticleUpload & { anonymous?: boolean },
  ) {
    this.logger.log(
      `AI 게시글 생성 시작 - 사용자: ${aiUser.id}, 익명: ${articleData.anonymous}`,
    );

    // AI 작성자 정보 생성
    const authorInfo = this.aiProfileService.generateAiAuthorInfo(
      articleData.anonymous,
    );
    this.logger.log(`AI 작성자 정보 생성 완료: ${JSON.stringify(authorInfo)}`);

    // 익명 처리
    const anonymousName = articleData.anonymous ? authorInfo.displayName : null;

    // 게시글 생성 (AI 전용 로직)
    const result = await this.articleRepository.createArticle(
      aiUser.id,
      {
        ...articleData,
        anonymous: articleData.anonymous || false,
      },
      anonymousName,
    );

    this.logger.log(`AI 게시글 생성 완료 - ID: ${result.id}`);

    return {
      ...result,
      aiAuthorInfo: authorInfo,
      message: 'AI 게시글이 성공적으로 생성되었습니다.',
    };
  }

  /**
   * AI가 댓글 작성
   */
  async createAiComment(
    aiUser: AuthenticationUser,
    articleId: string,
    commentData: CommentUpload & { anonymous?: boolean },
  ) {
    // 게시글 존재 확인
    const article = await this.articleRepository.getArticleById(articleId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // AI 작성자 정보 생성
    const authorInfo = this.aiProfileService.generateAiAuthorInfo(
      commentData.anonymous,
    );

    // 익명 처리
    const anonymousName = commentData.anonymous ? authorInfo.displayName : null;

    // 댓글 생성 (AI 전용 로직)
    const result = await this.commentRepository.createComment(
      articleId,
      aiUser.id,
      authorInfo.name, // AI가 생성한 이름 사용
      {
        ...commentData,
        anonymous: commentData.anonymous || false,
      },
      anonymousName,
    );

    return {
      ...result,
      aiAuthorInfo: authorInfo,
      message: 'AI 댓글이 성공적으로 생성되었습니다.',
    };
  }

  /**
   * AI 컨텐츠 생성 통계
   */
  async getAiContentStats() {
    // 향후 AI 생성 컨텐츠 추적을 위한 메서드
    return {
      message: 'AI 컨텐츠 통계 기능은 향후 구현 예정입니다.',
      note: 'AI 생성 컨텐츠는 isAiGenerated 플래그로 구분됩니다.',
    };
  }
}
