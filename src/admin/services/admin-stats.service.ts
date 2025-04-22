import { Injectable } from '@nestjs/common';
import { AdminStatsRepository } from '../repositories/admin-stats.repository';

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
}
