import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { ArticleUpload, ContentUpdate } from '../dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createArticleApiResponse,
  deleteArticleApiResponse,
  getArticleByIdApiResponse,
  getArticleCategoriesApiResponse,
  getArticlesApiResponse,
  likeArticleApiResponse,
  updateArticleApiResponse,
} from '../docs/article.docs';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/types/enum';
import { AuthenticationUser } from '@/types/auth';

@ApiTags('게시글')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Post()
  @ApiOperation({
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다.',
  })
  @ApiResponse(createArticleApiResponse)
  async createArticle(
    @CurrentUser() user: AuthenticationUser,
    @Body() articleData: ArticleUpload,
  ) {
    return await this.articleService.createArticle(user.id, articleData);
  }

  @ApiOperation({
    summary: '게시글 카테고리 조회',
    description: '게시글 카테고리 목록을 조회합니다.',
  })
  @ApiResponse(getArticleCategoriesApiResponse)
  @Get('category/list')
  async getArticleCategories() {
    return await this.articleService.getArticleCategories();
  }

  @Get(':categoryId')
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '게시글 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiParam({
    name: 'categoryId',
    required: true,
    description: '게시글 카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string'
  })
  @ApiResponse(getArticlesApiResponse)
  async getArticles(
    @Param('categoryId')
    categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.getArticles(categoryId, page, limit, user.id);
  }

  @Get('details/:id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글의 상세 정보를 조회합니다.',
  })
  @ApiResponse(getArticleByIdApiResponse)
  async getArticleById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.getArticleById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '게시글 수정',
    description:
      '특정 게시글을 수정합니다. 작성자 본인 또는 관리자만 수정할 수 있습니다.',
  })
  @ApiResponse(updateArticleApiResponse)
  async updateArticle(
    @Param('id') id: string,
    @Body() data: ContentUpdate,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.articleService.updateArticle(id, user.id, isAdmin, data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '게시글 삭제',
    description:
      '특정 게시글을 삭제합니다. 작성자 본인 또는 관리자만 삭제할 수 있습니다.',
  })
  @ApiResponse(deleteArticleApiResponse)
  async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.articleService.deleteArticle(id, user.id, isAdmin);
  }

  @Patch(':id/like')
  @ApiOperation({
    summary: '게시글 좋아요',
    description: '게시글에 좋아요를 추가하거나 취소합니다.',
  })
  @ApiResponse(likeArticleApiResponse)
  async likeArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.updateLikeCount(id, user.id);
  }
}
