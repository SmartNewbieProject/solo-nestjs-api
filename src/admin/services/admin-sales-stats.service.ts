import { Injectable, Logger } from '@nestjs/common';
import { AdminSalesStatsRepository } from '../repositories/admin-sales-stats.repository';
import {
  CustomPeriodSalesRequest,
  CustomPeriodSalesTrendResponse,
  DailySalesTrendResponse,
  MonthlySalesTrendResponse,
  PaymentSuccessRateResponse,
  WeeklySalesTrendResponse,
} from '../dto/sales-stats.dto';

@Injectable()
export class AdminSalesStatsService {
  private readonly logger = new Logger(AdminSalesStatsService.name);

  constructor(
    private readonly adminSalesStatsRepository: AdminSalesStatsRepository,
  ) {}

  /**
   * 총 매출액을 조회합니다.
   */
  async getTotalSales(): Promise<{ totalSales: number; totalCount: number }> {
    try {
      const { totalAmount, totalCount } = await this.adminSalesStatsRepository.getTotalSales();
      return { totalSales: totalAmount, totalCount };
    } catch (error) {
      this.logger.error(`총 매출액 조회 오류: ${error.message}`, error.stack);
      return { totalSales: 0, totalCount: 0 };
    }
  }

  /**
   * 오늘 매출액을 조회합니다.
   */
  async getDailySales(): Promise<{ dailySales: number; dailyCount: number }> {
    try {
      const { dailyAmount, dailyCount } = await this.adminSalesStatsRepository.getDailySales();
      return { dailySales: dailyAmount, dailyCount };
    } catch (error) {
      this.logger.error(`일간 매출액 조회 오류: ${error.message}`, error.stack);
      return { dailySales: 0, dailyCount: 0 };
    }
  }

  /**
   * 이번 주 매출액을 조회합니다.
   */
  async getWeeklySales(): Promise<{ weeklySales: number; weeklyCount: number }> {
    try {
      const { weeklyAmount, weeklyCount } = await this.adminSalesStatsRepository.getWeeklySales();
      return { weeklySales: weeklyAmount, weeklyCount };
    } catch (error) {
      this.logger.error(`주간 매출액 조회 오류: ${error.message}`, error.stack);
      return { weeklySales: 0, weeklyCount: 0 };
    }
  }

  /**
   * 이번 달 매출액을 조회합니다.
   */
  async getMonthlySales(): Promise<{ monthlySales: number; monthlyCount: number }> {
    try {
      const { monthlyAmount, monthlyCount } = await this.adminSalesStatsRepository.getMonthlySales();
      return { monthlySales: monthlyAmount, monthlyCount };
    } catch (error) {
      this.logger.error(`월간 매출액 조회 오류: ${error.message}`, error.stack);
      return { monthlySales: 0, monthlyCount: 0 };
    }
  }

  /**
   * 사용자 지정 기간 내 매출액을 조회합니다.
   */
  async getCustomPeriodSales(params: CustomPeriodSalesRequest): Promise<{ 
    totalSales: number;
    totalCount: number;
    startDate: string;
    endDate: string;
  }> {
    try {
      const { startDate, endDate } = params;
      const { totalAmount, totalCount } = await this.adminSalesStatsRepository.getCustomPeriodSales(startDate, endDate);
      return { totalSales: totalAmount, totalCount, startDate, endDate };
    } catch (error) {
      this.logger.error(`사용자 지정 기간 매출액 조회 오류: ${error.message}`, error.stack);
      return { totalSales: 0, totalCount: 0, startDate: params.startDate, endDate: params.endDate };
    }
  }

  /**
   * 일별 매출 추이 데이터를 조회합니다.
   */
  async getDailySalesTrend(): Promise<DailySalesTrendResponse> {
    try {
      const data = await this.adminSalesStatsRepository.getDailySalesTrend();
      return { data };
    } catch (error) {
      this.logger.error(`일별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return { data: [] };
    }
  }

  /**
   * 주별 매출 추이 데이터를 조회합니다.
   */
  async getWeeklySalesTrend(): Promise<WeeklySalesTrendResponse> {
    try {
      const data = await this.adminSalesStatsRepository.getWeeklySalesTrend();
      return { data };
    } catch (error) {
      this.logger.error(`주별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return { data: [] };
    }
  }

  /**
   * 월별 매출 추이 데이터를 조회합니다.
   */
  async getMonthlySalesTrend(): Promise<MonthlySalesTrendResponse> {
    try {
      const data = await this.adminSalesStatsRepository.getMonthlySalesTrend();
      return { data };
    } catch (error) {
      this.logger.error(`월별 매출 추이 조회 오류: ${error.message}`, error.stack);
      return { data: [] };
    }
  }

  /**
   * 사용자 지정 기간 내 일별 매출 추이 데이터를 조회합니다.
   */
  async getCustomPeriodSalesTrend(params: CustomPeriodSalesRequest): Promise<CustomPeriodSalesTrendResponse> {
    try {
      const { startDate, endDate } = params;
      const data = await this.adminSalesStatsRepository.getCustomPeriodSalesTrend(startDate, endDate);
      return { data, startDate, endDate };
    } catch (error) {
      this.logger.error(`사용자 지정 기간 매출 추이 조회 오류: ${error.message}`, error.stack);
      return { data: [], startDate: params.startDate, endDate: params.endDate };
    }
  }

  /**
   * 결제 성공률을 계산합니다.
   */
  async getPaymentSuccessRate(): Promise<PaymentSuccessRateResponse> {
    try {
      return await this.adminSalesStatsRepository.getPaymentSuccessRate();
    } catch (error) {
      this.logger.error(`결제 성공률 조회 오류: ${error.message}`, error.stack);
      return {
        date: new Date().toISOString().split('T')[0],
        totalAttempts: 0,
        successfulPayments: 0,
        successRate: 0,
      };
    }
  }
}
