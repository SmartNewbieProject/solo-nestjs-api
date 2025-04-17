import { Body, Controller, Post, Param } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { ReportUpload } from '../dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createReportApiResponse } from '../docs/report.docs';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/types/enum';
import { AuthenticationUser } from '@/types/auth';

@Controller('articles/:articleId/reports')
@ApiTags('신고')
@Roles(Role.USER, Role.ADMIN)
@ApiBearerAuth('access-token')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({
    summary: '게시글 신고',
    description: '특정 게시글을 신고합니다',
  })
  @ApiResponse(createReportApiResponse)
  async createReport(
    @Param('articleId') articleId: string,
    @Body() data: ReportUpload,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.reportService.createReport(articleId, user.id, data);
  }
}
