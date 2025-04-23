import { Injectable, Logger } from '@nestjs/common';
import { AdminWithdrawalStatsRepository } from '../repositories/admin-withdrawal-stats.repository';
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

@Injectable()
export class AdminWithdrawalStatsService {
  private readonly logger = new Logger(AdminWithdrawalStatsService.name);

  constructor(
    private readonly adminWithdrawalStatsRepository: AdminWithdrawalStatsRepository,
  ) {}

  /**
   * 총 탈퇴자 수를 조회합니다.
   */
  async getTotalWithdrawalsCount(): Promise<{ totalWithdrawals: number }> {
    try {
      const totalWithdrawals = await this.adminWithdrawalStatsRepository.getTotalWithdrawalsCount();
      return { totalWithdrawals };
    } catch (error) {
      this.logger.error(`총 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return { totalWithdrawals: 0 };
    }
  }

  /**
   * 오늘 탈퇴한 회원 수를 조회합니다.
   */
  async getDailyWithdrawalCount(): Promise<{ dailyWithdrawals: number }> {
    try {
      const dailyWithdrawals = await this.adminWithdrawalStatsRepository.getDailyWithdrawalCount();
      return { dailyWithdrawals };
    } catch (error) {
      this.logger.error(`일간 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return { dailyWithdrawals: 0 };
    }
  }

  /**
   * 이번 주 탈퇴한 회원 수를 조회합니다.
   */
  async getWeeklyWithdrawalCount(): Promise<{ weeklyWithdrawals: number }> {
    try {
      const weeklyWithdrawals = await this.adminWithdrawalStatsRepository.getWeeklyWithdrawalCount();
      return { weeklyWithdrawals };
    } catch (error) {
      this.logger.error(`주간 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return { weeklyWithdrawals: 0 };
    }
  }

  /**
   * 이번 달 탈퇴한 회원 수를 조회합니다.
   */
  async getMonthlyWithdrawalCount(): Promise<{ monthlyWithdrawals: number }> {
    try {
      const monthlyWithdrawals = await this.adminWithdrawalStatsRepository.getMonthlyWithdrawalCount();
      return { monthlyWithdrawals };
    } catch (error) {
      this.logger.error(`월간 탈퇴자 수 조회 오류: ${error.message}`, error.stack);
      return { monthlyWithdrawals: 0 };
    }
  }

  /**
   * 사용자 지정 기간 내 탈퇴한 회원 수를 조회합니다.
   */
  async getCustomPeriodWithdrawalCount(params: CustomPeriodWithdrawalRequest): Promise<{
    totalWithdrawals: number;
    startDate: string;
    endDate: string;
  }> {
    const { startDate, endDate } = params;
    const totalWithdrawals = await this.adminWithdrawalStatsRepository.getCustomPeriodWithdrawalCount(startDate, endDate);
    return { totalWithdrawals, startDate, endDate };
  }

  /**
   * 일별 탈퇴 추이 데이터를 조회합니다.
   */
  async getDailyWithdrawalTrend(): Promise<DailyWithdrawalTrendResponse> {
    const data = await this.adminWithdrawalStatsRepository.getDailyWithdrawalTrend();
    return { data };
  }

  /**
   * 주별 탈퇴 추이 데이터를 조회합니다.
   */
  async getWeeklyWithdrawalTrend(): Promise<WeeklyWithdrawalTrendResponse> {
    const data = await this.adminWithdrawalStatsRepository.getWeeklyWithdrawalTrend();
    return { data };
  }

  /**
   * 월별 탈퇴 추이 데이터를 조회합니다.
   */
  async getMonthlyWithdrawalTrend(): Promise<MonthlyWithdrawalTrendResponse> {
    const data = await this.adminWithdrawalStatsRepository.getMonthlyWithdrawalTrend();
    return { data };
  }

  /**
   * 사용자 지정 기간 내 일별 탈퇴 추이 데이터를 조회합니다.
   */
  async getCustomPeriodWithdrawalTrend(params: CustomPeriodWithdrawalRequest): Promise<CustomPeriodWithdrawalTrendResponse> {
    const { startDate, endDate } = params;
    const data = await this.adminWithdrawalStatsRepository.getCustomPeriodWithdrawalTrend(startDate, endDate);
    return { data, startDate, endDate };
  }

  /**
   * 탈퇴 사유별 통계를 조회합니다.
   */
  async getWithdrawalReasonStats(): Promise<WithdrawalReasonStatsResponse> {
    return await this.adminWithdrawalStatsRepository.getWithdrawalReasonStats();
  }

  /**
   * 서비스 사용 기간 통계를 조회합니다.
   */
  async getServiceDurationStats(): Promise<ServiceDurationStatsResponse> {
    return await this.adminWithdrawalStatsRepository.getServiceDurationStats();
  }

  /**
   * 이탈률을 계산합니다.
   */
  async getChurnRate(): Promise<ChurnRateResponse> {
    return await this.adminWithdrawalStatsRepository.getChurnRate();
  }
}
