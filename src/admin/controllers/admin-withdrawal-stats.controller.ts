import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminWithdrawalStatsService } from '../services/admin-withdrawal-stats.service';
import {
  ChurnRateResponse,
  CustomPeriodWithdrawalRequest,
  CustomPeriodWithdrawalTrendResponse,
  DailyWithdrawalTrendResponse,
  MonthlyWithdrawalTrendResponse,
  ServiceDurationStatsResponse,
  WeeklyWithdrawalTrendResponse,
  WithdrawalReasonStatsResponse,
} from '../dto/withdrawal-stats.dto';

@Controller('admin/stats/withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민 - 회원 탈퇴 지표')
@ApiBearerAuth('access-token')
export class AdminWithdrawalStatsController {
  constructor(private readonly adminWithdrawalStatsService: AdminWithdrawalStatsService) {}

  @Get('total')
  @ApiOperation({
    summary: '총 탈퇴자 수 조회',
    description: '서비스 론칭 이후 총 탈퇴자 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '총 탈퇴자 수 조회 성공',
    schema: {
      example: {
        totalWithdrawals: 118
      }
    }
  })
  async getTotalWithdrawalsCount() {
    return await this.adminWithdrawalStatsService.getTotalWithdrawalsCount();
  }

  @Get('daily')
  @ApiOperation({
    summary: '일간 탈퇴자 수 조회',
    description: '오늘 탈퇴한 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일간 탈퇴자 수 조회 성공',
    schema: {
      example: {
        dailyWithdrawals: 5
      }
    }
  })
  async getDailyWithdrawalCount() {
    return await this.adminWithdrawalStatsService.getDailyWithdrawalCount();
  }

  @Get('weekly')
  @ApiOperation({
    summary: '주간 탈퇴자 수 조회',
    description: '이번 주 탈퇴한 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주간 탈퇴자 수 조회 성공',
    schema: {
      example: {
        weeklyWithdrawals: 23
      }
    }
  })
  async getWeeklyWithdrawalCount() {
    return await this.adminWithdrawalStatsService.getWeeklyWithdrawalCount();
  }

  @Get('monthly')
  @ApiOperation({
    summary: '월간 탈퇴자 수 조회',
    description: '이번 달 탈퇴한 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '월간 탈퇴자 수 조회 성공',
    schema: {
      example: {
        monthlyWithdrawals: 87
      }
    }
  })
  async getMonthlyWithdrawalCount() {
    return await this.adminWithdrawalStatsService.getMonthlyWithdrawalCount();
  }

  @Post('custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 탈퇴자 수 조회',
    description: '사용자가 지정한 기간 내 탈퇴한 회원 수를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 탈퇴자 수 조회 성공',
    schema: {
      example: {
        totalWithdrawals: 42,
        startDate: '2025-01-01',
        endDate: '2025-04-23'
      }
    }
  })
  async getCustomPeriodWithdrawalCount(@Body() params: CustomPeriodWithdrawalRequest) {
    return await this.adminWithdrawalStatsService.getCustomPeriodWithdrawalCount(params);
  }

  @Get('trend/daily')
  @ApiOperation({
    summary: '일별 탈퇴 추이 조회',
    description: '최근 30일간의 일별 탈퇴자 수 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일별 탈퇴 추이 조회 성공',
    type: DailyWithdrawalTrendResponse
  })
  async getDailyWithdrawalTrend(): Promise<DailyWithdrawalTrendResponse> {
    return await this.adminWithdrawalStatsService.getDailyWithdrawalTrend();
  }

  @Get('trend/weekly')
  @ApiOperation({
    summary: '주별 탈퇴 추이 조회',
    description: '최근 12주간의 주별 탈퇴자 수 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주별 탈퇴 추이 조회 성공',
    type: WeeklyWithdrawalTrendResponse
  })
  async getWeeklyWithdrawalTrend(): Promise<WeeklyWithdrawalTrendResponse> {
    return await this.adminWithdrawalStatsService.getWeeklyWithdrawalTrend();
  }

  @Get('trend/monthly')
  @ApiOperation({
    summary: '월별 탈퇴 추이 조회',
    description: '최근 12개월간의 월별 탈퇴자 수 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '월별 탈퇴 추이 조회 성공',
    type: MonthlyWithdrawalTrendResponse
  })
  async getMonthlyWithdrawalTrend(): Promise<MonthlyWithdrawalTrendResponse> {
    return await this.adminWithdrawalStatsService.getMonthlyWithdrawalTrend();
  }

  @Post('trend/custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 탈퇴 추이 조회',
    description: '사용자가 지정한 기간 내 일별 탈퇴자 수 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 탈퇴 추이 조회 성공',
    type: CustomPeriodWithdrawalTrendResponse
  })
  async getCustomPeriodWithdrawalTrend(@Body() params: CustomPeriodWithdrawalRequest): Promise<CustomPeriodWithdrawalTrendResponse> {
    return await this.adminWithdrawalStatsService.getCustomPeriodWithdrawalTrend(params);
  }

  @Get('reasons')
  @ApiOperation({
    summary: '탈퇴 사유 통계 조회',
    description: '탈퇴 사유별 통계를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '탈퇴 사유 통계 조회 성공',
    type: WithdrawalReasonStatsResponse
  })
  async getWithdrawalReasonStats(): Promise<WithdrawalReasonStatsResponse> {
    return await this.adminWithdrawalStatsService.getWithdrawalReasonStats();
  }

  @Get('service-duration')
  @ApiOperation({
    summary: '서비스 사용 기간 통계 조회',
    description: '가입부터 탈퇴까지의 서비스 사용 기간 통계를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서비스 사용 기간 통계 조회 성공',
    type: ServiceDurationStatsResponse
  })
  async getServiceDurationStats(): Promise<ServiceDurationStatsResponse> {
    return await this.adminWithdrawalStatsService.getServiceDurationStats();
  }

  @Get('churn-rate')
  @ApiOperation({
    summary: '이탈률 조회',
    description: '일간/주간/월간 이탈률을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '이탈률 조회 성공',
    type: ChurnRateResponse
  })
  async getChurnRate(): Promise<ChurnRateResponse> {
    return await this.adminWithdrawalStatsService.getChurnRate();
  }
}
