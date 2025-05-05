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
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/types/enum';
import { AuthenticationUser } from '@/types/auth';
import { ArticleRequestType } from '../types/article.types';
import { ArticleSwagger } from '../docs';

@ArticleSwagger.controller()
@Roles(Role.USER, Role.ADMIN)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Post()
  @ArticleSwagger.createArticle()
  async createArticle(
    @CurrentUser() user: AuthenticationUser,
    @Body() articleData: ArticleUpload,
  ) {
    return await this.articleService.createArticle(user.id, articleData);
  }

  @Get('category/list')
  @ArticleSwagger.getArticleCategories()
  async getArticleCategories() {
    return await this.articleService.getArticleCategories();
  }

  @Get(':categoryCode')
  @ArticleSwagger.getArticles()
  async getArticles(
    @Param('categoryCode')
    categoryCode: ArticleRequestType,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.getArticles(categoryCode, page, limit, user.id);
  }

  @Get('details/:id')
  @ArticleSwagger.getArticleById()
  async getArticleById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.getArticleById(id, user.id);
  }

  @Patch(':id')
  @ArticleSwagger.updateArticle()
  async updateArticle(
    @Param('id') id: string,
    @Body() data: ContentUpdate,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.articleService.updateArticle(id, user.id, isAdmin, data);
  }

  @Delete(':id')
  @ArticleSwagger.deleteArticle()
  async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.articleService.deleteArticle(id, user.id, isAdmin);
  }

  @Patch(':id/like')
  @ArticleSwagger.likeArticle()
  async likeArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.articleService.updateLikeCount(id, user.id);
  }

  @Get('/hot/latest')
  @ArticleSwagger.getLatestHotArticles()
  async getLatestHotArticles() {
    return await this.articleService.getLatestHotArticles();
  }

}
