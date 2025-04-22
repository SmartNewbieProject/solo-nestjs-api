import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminStatsService } from '../services/admin-stats.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CustomPeriodRequest,
  CustomPeriodResponse,
  CustomPeriodTrendResponse,
  DailySignupTrendResponse,
  GenderStatsResponse,
  MonthlySignupTrendResponse,
  WeeklySignupTrendResponse
} from '../dto/stats.dto';
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

  @Get('users/weekly')
  @ApiOperation({
    summary: '주간 회원가입자 수 조회',
    description: '이번 주(월요일~일요일) 가입한 회원 수를 조회합니다. 매주 월요일에 리셋됩니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주간 회원가입자 수 조회 성공',
    schema: {
      type: 'object',
      properties: {
        weeklySignups: {
          type: 'number',
          example: 156,
          description: '이번 주 가입한 회원 수'
        }
      }
    }
  })
  async getWeeklySignupCount() {
    return await this.adminStatsService.getWeeklySignupCount();
  }

  @Get('users/trend/daily')
  @ApiOperation({
    summary: '일별 회원가입 추이 조회',
    description: '최근 30일간의 일별 회원가입 추이 데이터를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일별 회원가입 추이 조회 성공',
    type: DailySignupTrendResponse
  })
  async getDailySignupTrend(): Promise<DailySignupTrendResponse> {
    return await this.adminStatsService.getDailySignupTrend();
  }

  @Get('users/trend/weekly')
  @ApiOperation({
    summary: '주별 회원가입 추이 조회',
    description: '최근 12주간의 주별 회원가입 추이 데이터를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주별 회원가입 추이 조회 성공',
    type: WeeklySignupTrendResponse
  })
  async getWeeklySignupTrend(): Promise<WeeklySignupTrendResponse> {
    return await this.adminStatsService.getWeeklySignupTrend();
  }

  @Get('users/trend/monthly')
  @ApiOperation({
    summary: '월별 회원가입 추이 조회',
    description: '최근 12개월간의 월별 회원가입 추이 데이터를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '월별 회원가입 추이 조회 성공',
    type: MonthlySignupTrendResponse
  })
  async getMonthlySignupTrend(): Promise<MonthlySignupTrendResponse> {
    return await this.adminStatsService.getMonthlySignupTrend();
  }

  @Post('users/custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 내 회원가입자 수 조회',
    description: '사용자가 지정한 기간 내 회원가입자 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 내 회원가입자 수 조회 성공',
    type: CustomPeriodResponse
  })
  async getCustomPeriodSignupCount(@Body() customPeriodRequest: CustomPeriodRequest): Promise<CustomPeriodResponse> {
    const { startDate, endDate } = customPeriodRequest;
    return await this.adminStatsService.getCustomPeriodSignupCount(startDate, endDate);
  }

  @Get('users/this-week')
  @ApiOperation({
    summary: '이번 주 회원가입자 수 조회 (정확한 값)',
    description: '이번 주(월요일~일요일) 가입한 회원 수를 정확하게 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '이번 주 회원가입자 수 조회 성공',
    type: CustomPeriodResponse
  })
  async getThisWeekSignupCount(): Promise<CustomPeriodResponse> {
    return await this.adminStatsService.getThisWeekSignupCount();
  }

  @Post('users/trend/custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 내 회원가입 추이 조회',
    description: '사용자가 지정한 기간 내 일별 회원가입 추이 데이터를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 내 회원가입 추이 조회 성공',
    type: CustomPeriodTrendResponse
  })
  async getCustomPeriodSignupTrend(@Body() customPeriodRequest: CustomPeriodRequest): Promise<CustomPeriodTrendResponse> {
    const { startDate, endDate } = customPeriodRequest;
    return await this.adminStatsService.getCustomPeriodSignupTrend(startDate, endDate);
  }

  @Get('users/gender')
  @ApiOperation({
    summary: '성별 통계 조회',
    description: '전체 남성 유저 수, 여성 유저 수, 성비 비율을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '성별 통계 조회 성공',
    type: GenderStatsResponse
  })
  async getGenderStats(): Promise<GenderStatsResponse> {
    return await this.adminStatsService.getGenderStats();
  }
}
