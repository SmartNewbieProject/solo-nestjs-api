import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminStatsService } from '../services/admin-stats.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민')
@ApiBearerAuth('access-token')
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get('users/total')
  @ApiOperation({
    summary: '누적 회원가입자 수 조회',
    description: '현재까지 가입한 총 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '누적 회원가입자 수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        totalUsers: {
          type: 'number',
          example: 1234,
          description: '총 회원가입자 수'
        }
      }
    }
  })
  async getTotalUsersCount() {
    return await this.adminStatsService.getTotalUsersCount();
  }

  @Get('users/daily')
  @ApiOperation({
    summary: '일간 회원가입자 수 조회',
    description: '오늘(00:00~23:59) 가입한 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일간 회원가입자 수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        dailySignups: {
          type: 'number',
          example: 42,
          description: '오늘 가입한 회원 수'
        }
      }
    }
  })
  async getDailySignupCount() {
    return await this.adminStatsService.getDailySignupCount();
  }
}
