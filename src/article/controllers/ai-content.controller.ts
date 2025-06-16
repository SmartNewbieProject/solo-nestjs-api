import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiContentService } from '../services/ai-content.service';
import { ArticleUpload, CommentUpload } from '../dto';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';

/**
 * AI 서버 전용 컨트롤러
 * 환경변수에 설정된 영구 토큰으로만 접근 가능
 */
@Controller('ai/content')
@ApiTags('AI 컨텐츠 생성')
@ApiBearerAuth('access-token')
export class AiContentController {
  constructor(private readonly aiContentService: AiContentService) {}

  @Post('articles')
  @ApiOperation({ 
    summary: 'AI 게시글 생성', 
    description: 'AI 서버가 랜덤 프로필로 게시글을 생성합니다. 영구 토큰 필요.' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '게시글 제목' },
        content: { type: 'string', description: '게시글 내용' },
        type: { type: 'string', description: '카테고리 코드', enum: ['general', 'review', 'love-concerns'] },
        anonymous: { type: 'boolean', description: '익명 여부 (선택) - 익명이어도 대학교 정보는 표시됨', default: false }
      },
      required: ['title', 'content', 'type']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'AI 게시글 생성 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        aiAuthorInfo: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '랜덤 생성된 이름' },
            university: { type: 'string', description: '랜덤 선택된 대학교' },
            universityLogo: { type: 'string', description: '대학교 로고 URL', nullable: true },
            department: { type: 'string', description: '해당 대학교의 실제 학과' },
            grade: { type: 'string', description: '학년' },
            gender: { type: 'string', description: '성별' },
            age: { type: 'number', description: '나이 (19-22세)' },
            isAiGenerated: { type: 'boolean', description: 'AI 생성 여부' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async createAiArticle(
    @CurrentUser() aiUser: AuthenticationUser,
    @Body() articleData: ArticleUpload & { anonymous?: boolean }
  ) {
    return await this.aiContentService.createAiArticle(aiUser, articleData);
  }

  @Post('articles/:articleId/comments')
  @ApiOperation({ 
    summary: 'AI 댓글 생성', 
    description: 'AI 서버가 랜덤 프로필로 댓글을 생성합니다. 영구 토큰 필요.' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '댓글 내용' },
        anonymous: { type: 'boolean', description: '익명 여부 (선택) - 익명이어도 대학교 정보는 표시됨', default: false }
      },
      required: ['content']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'AI 댓글 생성 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        aiAuthorInfo: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '랜덤 생성된 이름' },
            university: { type: 'string', description: '랜덤 선택된 대학교' },
            universityLogo: { type: 'string', description: '대학교 로고 URL', nullable: true },
            department: { type: 'string', description: '해당 대학교의 실제 학과' },
            grade: { type: 'string', description: '학년' },
            gender: { type: 'string', description: '성별' },
            age: { type: 'number', description: '나이 (19-22세)' },
            isAiGenerated: { type: 'boolean', description: 'AI 생성 여부' }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async createAiComment(
    @CurrentUser() aiUser: AuthenticationUser,
    @Param('articleId') articleId: string,
    @Body() commentData: CommentUpload & { anonymous?: boolean }
  ) {
    return await this.aiContentService.createAiComment(aiUser, articleId, commentData);
  }
}
