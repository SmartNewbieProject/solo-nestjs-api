import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CommentUpdate, CommentUpload } from '../dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createCommentApiResponse,
  deleteCommentApiResponse,
  getCommentsByPostIdApiResponse,
  updateCommentApiResponse,
} from '../docs/comment.docs';
import { CurrentUser } from '@/auth/decorators';
import { Role } from '@/types/enum';
import { AuthenticationUser } from '@/types/auth';
import { Roles } from '@/auth/decorators';
import { CommentDetails } from '../types/comment.type';

@Controller('articles/:articleId/comments')
@ApiTags('댓글')
@Roles(Role.USER, Role.ADMIN)
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({
    summary: '댓글 생성',
    description: '특정 게시글에 댓글을 작성합니다.',
  })
  @ApiResponse(createCommentApiResponse)
  async createComment(
    @Param('articleId') articleId: string,
    @Body() data: CommentUpload,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.commentService.createComment(articleId, user, data);
  }

  @Get()
  @ApiOperation({
    summary: '댓글 목록 조회',
    description: '특정 게시글의 모든 댓글을 조회합니다.',
  })
  @ApiResponse(getCommentsByPostIdApiResponse)
  async getCommentsByPostId(
    @Param('articleId') articleId: string,
  ): Promise<CommentDetails[]> {
    return await this.commentService.getCommentsByPostId(articleId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '댓글 수정',
    description:
      '특정 댓글을 수정합니다. 작성자 본인 또는 관리자만 수정할 수 있습니다.',
  })
  @ApiResponse(updateCommentApiResponse)
  async updateComment(
    @Param('id') id: string,
    @Body() data: CommentUpdate,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.commentService.updateComment(id, user.id, isAdmin, data);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '댓글 삭제',
    description:
      '특정 댓글을 삭제합니다. 작성자 본인 또는 관리자만 삭제할 수 있습니다.',
  })
  @ApiResponse(deleteCommentApiResponse)
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return await this.commentService.deleteComment(id, user.id, isAdmin);
  }
}
