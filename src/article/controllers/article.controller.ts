import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { ArticleUpload } from '../dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createArticleApiResponse, getArticleByIdApiResponse, getArticlesApiResponse } from '../docs/article.docs';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/types/enum';
import { AuthenticationUser } from '@/types/auth';

@ApiTags('게시글')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: '게시글 작성', description: '새로운 게시글을 작성합니다.' })
  @ApiResponse(createArticleApiResponse)
  async createArticle(@CurrentUser() user: AuthenticationUser, @Body() articleData: ArticleUpload) {
    return await this.articleService.createArticle(user.id, articleData);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회', description: '게시글 목록을 페이지네이션으로 조회합니다.' })
  @ApiResponse(getArticlesApiResponse)
  async getArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return await this.articleService.getArticles(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회', description: '특정 게시글의 상세 정보를 조회합니다.' })
  @ApiResponse(getArticleByIdApiResponse)
  async getArticleById(@Param('id') id: string) {
    return await this.articleService.getArticleById(id);
  }
}
