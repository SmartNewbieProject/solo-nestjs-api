import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminUserService } from '../services/admin-user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { getUsersListApiResponse } from '../docs/user-list.docs';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/types/enum';
import { PaginatedResponse } from '@/types/pagination';
import { UserProfile } from '@/types/user';
import { AdminUserListRequest } from '../dto/user';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민')
@ApiBearerAuth('access-token')
export class AdminUserController {
  constructor(private readonly adminService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: '회원 목록 조회', description: '모든 회원 목록을 페이지네이션으로 조회합니다.' })
  @ApiResponse(getUsersListApiResponse)
  async getUsersList(@Query() query: AdminUserListRequest): Promise<PaginatedResponse<UserProfile>> {
    return await this.adminService.getUsersList({
      page: query.page || 1,
      limit: query.limit || 10
    });
  }
}
