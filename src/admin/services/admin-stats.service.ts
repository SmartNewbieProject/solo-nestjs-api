import { Injectable } from '@nestjs/common';
import { AdminStatsRepository } from '../repositories/admin-stats.repository';
import {
  CustomPeriodResponse,
  CustomPeriodTrendResponse,
  DailySignupTrendResponse,
  GenderStatsResponse,
  MonthlySignupTrendResponse,
  UniversityStatItem,
  UniversityStatsResponse,
  WeeklySignupTrendResponse
} from '../dto/stats.dto';

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

  /**
   * 사용자 지정 기간 내 회원가입자 수를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<CustomPeriodResponse>} 사용자 지정 기간 내 회원가입자 수
   */
  async getCustomPeriodSignupCount(startDate: string, endDate: string): Promise<CustomPeriodResponse> {
    const totalSignups = await this.adminStatsRepository.getCustomPeriodSignupCount(startDate, endDate);
    return { totalSignups, startDate, endDate };
  }

  /**
   * 이번 주 회원가입자 수를 정확하게 조회합니다.
   * @returns {Promise<CustomPeriodResponse>} 이번 주 회원가입자 수
   */
  async getThisWeekSignupCount(): Promise<CustomPeriodResponse> {
    // 이번 주의 월요일과 일요일 가져오기
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

    // 이번 주의 월요일 가져오기
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // 이번 주의 일요일 가져오기
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // 날짜 형식화 (YYYY-MM-DD)
    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];

    const totalSignups = await this.adminStatsRepository.getCustomPeriodSignupCount('this-week', 'this-week');
    return { totalSignups, startDate, endDate };
  }

  /**
   * 사용자 지정 기간 내 일별 회원가입 추이 데이터를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   * @returns {Promise<CustomPeriodTrendResponse>} 사용자 지정 기간 내 일별 회원가입 추이 데이터
   */
  /**
   * 성별 통계를 조회합니다.
   * @returns {Promise<GenderStatsResponse>} 성별 통계 정보
   */
  /**
   * 대학별 통계를 조회합니다.
   * @returns {Promise<UniversityStatsResponse>} 대학별 통계 정보
   */
  async getUniversityStats(): Promise<UniversityStatsResponse> {
    const universityStats = await this.adminStatsRepository.getUniversityStats();
    const totalCount = universityStats.reduce((sum, university) => sum + university.totalCount, 0);

    // 대학별 통계 정보 계산
    const universities: UniversityStatItem[] = universityStats.map(university => {
      const { universityName, totalCount: uniTotalCount, maleCount, femaleCount } = university;

      // 전체 유저 대비 비율 계산 (소수점 2자리까지)
      const percentage = totalCount > 0 ? parseFloat(((uniTotalCount / totalCount) * 100).toFixed(2)) : 0;

      // 성비 비율 계산 (남성:여성)
      let genderRatio = '0:0';
      if (femaleCount > 0) {
        const ratio = maleCount / femaleCount;
        genderRatio = `${ratio.toFixed(1)}:1`;
      } else if (maleCount > 0) {
        genderRatio = '∞:1'; // 여성이 0명인 경우
      }

      return {
        universityName,
        totalCount: uniTotalCount,
        maleCount,
        femaleCount,
        percentage,
        genderRatio
      };
    });

    // 대학명 정렬 (총 회원 수 내림차순)
    universities.sort((a, b) => b.totalCount - a.totalCount);

    return {
      universities,
      totalCount
    };
  }

  async getGenderStats(): Promise<GenderStatsResponse> {
    const { maleCount, femaleCount } = await this.adminStatsRepository.getGenderStats();
    const totalCount = maleCount + femaleCount;

    // 비율 계산 (소수점 2자리까지)
    const malePercentage = totalCount > 0 ? parseFloat(((maleCount / totalCount) * 100).toFixed(2)) : 0;
    const femalePercentage = totalCount > 0 ? parseFloat(((femaleCount / totalCount) * 100).toFixed(2)) : 0;

    // 성비 비율 계산 (남성:여성)
    let genderRatio = '0:0';
    if (femaleCount > 0) {
      const ratio = maleCount / femaleCount;
      genderRatio = `${ratio.toFixed(1)}:1`;
    } else if (maleCount > 0) {
      genderRatio = '∞:1'; // 여성이 0명인 경우
    }

    return {
      maleCount,
      femaleCount,
      totalCount,
      malePercentage,
      femalePercentage,
      genderRatio
    };
  }

  async getCustomPeriodSignupTrend(startDate: string, endDate: string): Promise<CustomPeriodTrendResponse> {
    const data = await this.adminStatsRepository.getCustomPeriodSignupTrend(startDate, endDate);

    // 일별 데이터의 합계 계산
    const sumFromDailyData = data.reduce((sum, item) => sum + item.count, 0);

    // 전체 기간 회원가입자 수 조회
    const totalFromDB = await this.adminStatsRepository.getCustomPeriodSignupCount(startDate, endDate);

    // 두 값 중 더 정확한 값 사용 (일반적으로 DB에서 직접 조회한 값이 더 정확함)
    const totalSignups = totalFromDB;

    console.log(`일별 데이터 합계: ${sumFromDailyData}, DB 조회 합계: ${totalFromDB}`);

    return { data, startDate, endDate, totalSignups };
  }
}
