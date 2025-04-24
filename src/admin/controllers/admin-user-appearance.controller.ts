import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminUserAppearanceService } from '../services/admin-user-appearance.service';
import {
  AdminUserAppearanceListRequest,
  BulkSetUserAppearanceGradeRequest,
  SetUserAppearanceGradeRequest,
  SetUserAppearanceGradeResponse,
  UserAppearanceGradeStatsResponse,
  UserProfileWithAppearance
} from '../dto/user-appearance.dto';
import { PaginatedResponse } from '@/types/pagination';

@Controller('admin/users/appearance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민 - 유저 관리 및 등급 분류')
@ApiBearerAuth('access-token')
export class AdminUserAppearanceController {
  constructor(private readonly adminUserAppearanceService: AdminUserAppearanceService) {}

  @Get()
  @ApiOperation({
    summary: '유저 목록 조회 (외모 등급 포함)',
    description: '외모 등급 정보를 포함한 유저 목록을 필터링하여 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '유저 목록 조회 성공',
    schema: {
      allOf: [
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserProfileWithAppearance' }
            },
            meta: {
              type: 'object',
              properties: {
                totalItems: { type: 'number' },
                itemCount: { type: 'number' },
                itemsPerPage: { type: 'number' },
                totalPages: { type: 'number' },
                currentPage: { type: 'number' }
              }
            }
          }
        }
      ]
    }
  })
  async getUsersWithAppearanceGrade(
    @Query() query: AdminUserAppearanceListRequest
  ): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    return await this.adminUserAppearanceService.getUsersWithAppearanceGrade(query);
  }

  @Post('/grade')
  @ApiOperation({
    summary: '유저 외모 등급 설정',
    description: '특정 유저의 외모 등급을 설정합니다. 기본값은 미분류(UNCLASSIFIED)입니다.'
  })
  @ApiResponse({
    status: 200,
    description: '외모 등급 설정 성공',
    type: SetUserAppearanceGradeResponse
  })
  async setUserAppearanceGrade(
    @Body() request: SetUserAppearanceGradeRequest
  ): Promise<SetUserAppearanceGradeResponse> {
    return await this.adminUserAppearanceService.setUserAppearanceGrade(request);
  }

  @Post('/grade/bulk')
  @ApiOperation({
    summary: '유저 외모 등급 일괄 설정',
    description: '여러 유저의 외모 등급을 일괄적으로 설정합니다. 기본값은 미분류(UNCLASSIFIED)입니다.'
  })
  @ApiResponse({
    status: 200,
    description: '외모 등급 일괄 설정 성공',
    type: SetUserAppearanceGradeResponse
  })
  async bulkSetUserAppearanceGrade(
    @Body() request: BulkSetUserAppearanceGradeRequest
  ): Promise<SetUserAppearanceGradeResponse> {
    return await this.adminUserAppearanceService.bulkSetUserAppearanceGrade(request);
  }

  @Get('/stats')
  @ApiOperation({
    summary: '외모 등급 통계 조회',
    description: '외모 등급별 사용자 수 통계를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '외모 등급 통계 조회 성공',
    type: UserAppearanceGradeStatsResponse
  })
  async getAppearanceGradeStats(): Promise<UserAppearanceGradeStatsResponse> {
    return await this.adminUserAppearanceService.getAppearanceGradeStats();
  }

  @Get('/unclassified')
  @ApiOperation({
    summary: '미분류 유저 목록 조회',
    description: '외모 등급이 미분류(UNCLASSIFIED)인 유저 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '미분류 유저 목록 조회 성공',
    schema: {
      allOf: [
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserProfileWithAppearance' }
            },
            meta: {
              type: 'object',
              properties: {
                totalItems: { type: 'number' },
                itemCount: { type: 'number' },
                itemsPerPage: { type: 'number' },
                totalPages: { type: 'number' },
                currentPage: { type: 'number' }
              }
            }
          }
        }
      ]
    }
  })
  async getUnclassifiedUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    return await this.adminUserAppearanceService.getUnclassifiedUsers(page, limit);
  }
}
