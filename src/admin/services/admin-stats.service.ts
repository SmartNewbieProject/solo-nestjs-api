import { Injectable } from '@nestjs/common';
import { AdminStatsRepository } from '../repositories/admin-stats.repository';
import { DailySignupTrendResponse, MonthlySignupTrendResponse, WeeklySignupTrendResponse } from '../dto/stats.dto';

@Injectable()
export class AdminStatsService {
  constructor(
    private readonly adminStatsRepository: AdminStatsRepository,
  ) {}

  /**
   * 총 회원가입자 수를 조회합니다.
   * @returns {Promise<{ totalUsers: number }>} 총 회원가입자 수
   */
  async getTotalUsersCount(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.adminStatsRepository.getTotalUsersCount();
    return { totalUsers };
  }

  /**
   * 오늘 가입한 회원 수를 조회합니다.
   * @returns {Promise<{ dailySignups: number }>} 오늘 가입한 회원 수
   */
  async getDailySignupCount(): Promise<{ dailySignups: number }> {
    const dailySignups = await this.adminStatsRepository.getDailySignupCount();
    return { dailySignups };
  }

  /**
   * 주간 회원가입자 수를 조회합니다.
   * @returns {Promise<{ weeklySignups: number }>} 이번 주(월~일) 가입한 회원 수
   */
  async getWeeklySignupCount(): Promise<{ weeklySignups: number }> {
    const weeklySignups = await this.adminStatsRepository.getWeeklySignupCount();
    return { weeklySignups };
  }

  /**
   * 일별 회원가입 추이 데이터를 조회합니다.
   * @returns {Promise<DailySignupTrendResponse>} 최근 30일간의 일별 회원가입 추이 데이터
   */
  async getDailySignupTrend(): Promise<DailySignupTrendResponse> {
    const data = await this.adminStatsRepository.getDailySignupTrend();
    return { data };
  }

  /**
   * 주별 회원가입 추이 데이터를 조회합니다.
   * @returns {Promise<WeeklySignupTrendResponse>} 최근 12주간의 주별 회원가입 추이 데이터
   */
  async getWeeklySignupTrend(): Promise<WeeklySignupTrendResponse> {
    const data = await this.adminStatsRepository.getWeeklySignupTrend();
    return { data };
  } // FIX ME

  /**
   * 월별 회원가입 추이 데이터를 조회합니다.
   * @returns {Promise<MonthlySignupTrendResponse>} 최근 12개월간의 월별 회원가입 추이 데이터
   */
  async getMonthlySignupTrend(): Promise<MonthlySignupTrendResponse> {
    const data = await this.adminStatsRepository.getMonthlySignupTrend();
    return { data };
  }
}
