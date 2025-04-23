import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminSalesStatsService } from '../services/admin-sales-stats.service';
import {
  CustomPeriodSalesRequest,
  CustomPeriodSalesTrendResponse,
  DailySalesTrendResponse,
  MonthlySalesTrendResponse,
  PaymentSuccessRateResponse,
  WeeklySalesTrendResponse,
} from '../dto/sales-stats.dto';

@Controller('admin/stats/sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민 - 매출 지표')
@ApiBearerAuth('access-token')
export class AdminSalesStatsController {
  constructor(private readonly adminSalesStatsService: AdminSalesStatsService) {}

  @Get('total')
  @ApiOperation({
    summary: '총 매출액 조회',
    description: '서비스 론칭 이후 총 매출액을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '총 매출액 조회 성공',
    schema: {
      example: {
        totalSales: 1250000,
        totalCount: 118
      }
    }
  })
  async getTotalSales() {
    return await this.adminSalesStatsService.getTotalSales();
  }

  @Get('daily')
  @ApiOperation({
    summary: '일간 매출액 조회',
    description: '오늘 매출액을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일간 매출액 조회 성공',
    schema: {
      example: {
        dailySales: 50000,
        dailyCount: 5
      }
    }
  })
  async getDailySales() {
    return await this.adminSalesStatsService.getDailySales();
  }

  @Get('weekly')
  @ApiOperation({
    summary: '주간 매출액 조회',
    description: '이번 주 매출액을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주간 매출액 조회 성공',
    schema: {
      example: {
        weeklySales: 230000,
        weeklyCount: 23
      }
    }
  })
  async getWeeklySales() {
    return await this.adminSalesStatsService.getWeeklySales();
  }

  @Get('monthly')
  @ApiOperation({
    summary: '월간 매출액 조회',
    description: '이번 달 매출액을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '월간 매출액 조회 성공',
    schema: {
      example: {
        monthlySales: 870000,
        monthlyCount: 87
      }
    }
  })
  async getMonthlySales() {
    return await this.adminSalesStatsService.getMonthlySales();
  }

  @Post('custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 매출액 조회',
    description: '사용자가 지정한 기간 내 매출액을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 매출액 조회 성공',
    schema: {
      example: {
        totalSales: 420000,
        totalCount: 42,
        startDate: '2025-01-01',
        endDate: '2025-04-23'
      }
    }
  })
  async getCustomPeriodSales(@Body() params: CustomPeriodSalesRequest) {
    return await this.adminSalesStatsService.getCustomPeriodSales(params);
  }

  @Get('trend/daily')
  @ApiOperation({
    summary: '일별 매출 추이 조회',
    description: '최근 30일간의 일별 매출액 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '일별 매출 추이 조회 성공',
    type: DailySalesTrendResponse
  })
  async getDailySalesTrend(): Promise<DailySalesTrendResponse> {
    return await this.adminSalesStatsService.getDailySalesTrend();
  }

  @Get('trend/weekly')
  @ApiOperation({
    summary: '주별 매출 추이 조회',
    description: '최근 12주간의 주별 매출액 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '주별 매출 추이 조회 성공',
    type: WeeklySalesTrendResponse
  })
  async getWeeklySalesTrend(): Promise<WeeklySalesTrendResponse> {
    return await this.adminSalesStatsService.getWeeklySalesTrend();
  }

  @Get('trend/monthly')
  @ApiOperation({
    summary: '월별 매출 추이 조회',
    description: '최근 12개월간의 월별 매출액 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '월별 매출 추이 조회 성공',
    type: MonthlySalesTrendResponse
  })
  async getMonthlySalesTrend(): Promise<MonthlySalesTrendResponse> {
    return await this.adminSalesStatsService.getMonthlySalesTrend();
  }

  @Post('trend/custom-period')
  @ApiOperation({
    summary: '사용자 지정 기간 매출 추이 조회',
    description: '사용자가 지정한 기간 내 일별 매출액 추이를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 지정 기간 매출 추이 조회 성공',
    type: CustomPeriodSalesTrendResponse
  })
  async getCustomPeriodSalesTrend(@Body() params: CustomPeriodSalesRequest): Promise<CustomPeriodSalesTrendResponse> {
    return await this.adminSalesStatsService.getCustomPeriodSalesTrend(params);
  }

  @Get('success-rate')
  @ApiOperation({
    summary: '결제 성공률 조회',
    description: '결제 시도 대비 성공 비율을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '결제 성공률 조회 성공',
    type: PaymentSuccessRateResponse
  })
  async getPaymentSuccessRate(): Promise<PaymentSuccessRateResponse> {
    return await this.adminSalesStatsService.getPaymentSuccessRate();
  }
}
