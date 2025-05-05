import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createArticleApiResponse,
  deleteArticleApiResponse,
  getArticleByIdApiResponse,
  getArticleCategoriesApiResponse,
  getArticlesApiResponse,
  likeArticleApiResponse,
  updateArticleApiResponse,
} from './article.docs';

export const ArticleSwagger = {
  controller: () => applyDecorators(
    ApiTags('게시글'),
    ApiBearerAuth('access-token')
  ),

  createArticle: () => applyDecorators(
    ApiOperation({
      summary: '게시글 작성',
      description: '새로운 게시글을 작성합니다.',
    }),
    ApiResponse(createArticleApiResponse)
  ),

  getArticleCategories: () => applyDecorators(
    ApiOperation({
      summary: '게시글 카테고리 조회',
      description: '게시글 카테고리 목록을 조회합니다.',
    }),
    ApiResponse(getArticleCategoriesApiResponse)
  ),

  getArticles: () => applyDecorators(
    ApiOperation({
      summary: '게시글 목록 조회',
      description: '게시글 목록을 페이지네이션으로 조회합니다.',
    }),
    ApiParam({
      name: 'categoryId',
      required: true,
      description: '게시글 카테고리 ID',
      example: '123e4567-e89b-12d3-a456-426614174000',
      type: 'string'
    }),
    ApiResponse(getArticlesApiResponse)
  ),

  getArticleById: () => applyDecorators(
    ApiOperation({
      summary: '게시글 상세 조회',
      description: '특정 게시글의 상세 정보를 조회합니다.',
    }),
    ApiResponse(getArticleByIdApiResponse)
  ),

  updateArticle: () => applyDecorators(
    ApiOperation({
      summary: '게시글 수정',
      description:
        '특정 게시글을 수정합니다. 작성자 본인 또는 관리자만 수정할 수 있습니다.',
    }),
    ApiResponse(updateArticleApiResponse)
  ),

  deleteArticle: () => applyDecorators(
    ApiOperation({
      summary: '게시글 삭제',
      description:
        '특정 게시글을 삭제합니다. 작성자 본인 또는 관리자만 삭제할 수 있습니다.',
    }),
    ApiResponse(deleteArticleApiResponse)
  ),

  likeArticle: () => applyDecorators(
    ApiOperation({
      summary: '게시글 좋아요',
      description: '게시글에 좋아요를 추가하거나 취소합니다.',
    }),
    ApiResponse(likeArticleApiResponse)
  ),

  getLatestHotArticles: () => applyDecorators(
    ApiOperation({
      summary: '최근 인기 게시글 제목 조회',
      description: '최근 인기 게시글 제목을 5건 조회합니다.',
    })
  )
};
