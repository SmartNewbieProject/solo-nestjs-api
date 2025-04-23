import { Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminActivityService } from '../services/admin-activity.service';
import { UserActivityStatsResponse } from '../dto/activity-stats.dto';

@ApiTags('어드민 - 사용자 활동 지표')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('access-token')
export class AdminActivityController {
  private readonly logger = new Logger(AdminActivityController.name);

  constructor(
    private readonly adminActivityService: AdminActivityService,
  ) {}

  @Get('users/activity')
  @ApiOperation({
    summary: '사용자 활동 지표 조회',
    description: '활성 사용자 수, MAU, WAU, DAU, 실시간 활성 사용자, 활성화율, Stickiness, 시간대별 활성 사용자 분포를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 활동 지표 조회 성공',
    type: UserActivityStatsResponse
  })
  async getUserActivityStats(): Promise<UserActivityStatsResponse> {
    return await this.adminActivityService.getUserActivityStats();
  }


}
