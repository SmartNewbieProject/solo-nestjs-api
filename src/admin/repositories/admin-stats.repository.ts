import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users, profiles, universityDetails } from '@/database/schema';
import { count, sql, and, gte, lt, lte, eq } from 'drizzle-orm';
import { SignupTrendPoint } from '../dto/stats.dto';
import { Gender } from '@/types/enum';
import { getUniversities } from '@/auth/domain/university';

@Injectable()
export class AdminStatsRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  /**
   * 총 회원가입자 수를 조회합니다.
   * 삭제되지 않은 사용자만 카운트합니다.
   */
  async getTotalUsersCount(): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    return result[0].count;
  }

  /**
   * 오늘 가입한 회원 수를 조회합니다.
   * 오늘 00:00:00부터 23:59:59까지 생성된 사용자를 카운트합니다.
   */
  async getDailySignupCount(): Promise<number> {
    // 오늘 날짜의 시작(00:00:00)과 끝(23:59:59) 설정
    const today = new Date();
    // 한국 시간 기준으로 00:00:00 설정
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() + 9); // UTC+9 보정
    
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    endOfDay.setHours(endOfDay.getHours() + 9); // UTC+9 보정

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          sql`${users.createdAt}::text >= ${startOfDay.toISOString().replace('T', ' ').replace('Z', '')}`,
          sql`${users.createdAt}::text < ${endOfDay.toISOString().replace('T', ' ').replace('Z', '')}`
        )
      );

    return result[0].count;
  }

  /**
   * 주간 회원가입자 수를 조회합니다.
   * 이번 주의 월요일 00:00:00부터 일요일 23:59:59까지 생성된 사용자를 카운트합니다.
   */
  async getWeeklySignupCount(): Promise<number> {
    // 이번 주의 월요일과 일요일 가져오기
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

    // 이번 주의 월요일 가져오기 (현재가 월요일이면 오늘, 아니면 지난 월요일)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 일요일이면 -6, 월요일이면 0, 화요일이면 -1, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // 이번 주의 일요일 가져오기 (현재가 일요일이면 오늘, 아니면 다음 일요일)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          gte(users.createdAt, monday),
          lte(users.createdAt, sunday)
        )
      );

    return result[0].count;
  }

  /**
   * 일별 회원가입 추이 데이터를 조회합니다.
   * 최근 30일간의 일별 회원가입자 수를 조회합니다.
   */
  async getDailySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const result: SignupTrendPoint[] = [];

    // 최근 30일간의 데이터 조회
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, startOfDay),
            lt(users.createdAt, endOfDay)
          )
        );

      // 날짜 표시 형식: MM월 DD일
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const label = `${month}월 ${day}일`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }

  /**
   * 주별 회원가입 추이 데이터를 조회합니다.
   * 최근 12주간의 주별 회원가입자 수를 조회합니다.
   */
  async getWeeklySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const result: SignupTrendPoint[] = [];

    // 이번 주의 월요일 가져오기
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);

    // 최근 12주간의 데이터 조회
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(thisMonday);
      weekStart.setDate(thisMonday.getDate() - (7 * i));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, weekStart),
            lte(users.createdAt, weekEnd)
          )
        );

      // 주간 라벨 생성 (MM월 DD일 ~ MM월 DD일)
      const startMonth = weekStart.getMonth() + 1;
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.getMonth() + 1;
      const endDay = weekEnd.getDate();

      // 주간 라벨 형식: MM월 DD일 ~ MM월 DD일
      const label = `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }

  /**
   * 월별 회원가입 추이 데이터를 조회합니다.
   * 최근 12개월간의 월별 회원가입자 수를 조회합니다.
   */
  async getMonthlySignupTrend(): Promise<SignupTrendPoint[]> {
    const today = new Date();
    const result: SignupTrendPoint[] = [];

    // 최근 12개월간의 데이터 조회
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);

      // 다음 달의 1일에서 1밀리초를 빼서 현재 달의 마지막 날 23:59:59.999 가져오기
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
      endOfMonth.setMilliseconds(-1);

      const queryResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, startOfMonth),
            lte(users.createdAt, endOfMonth)
          )
        );

      // 월 라벨 형식: YYYY년 MM월
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = `${year}년 ${month}월`;

      result.push({
        label,
        count: queryResult[0].count
      });
    }

    return result;
  }

  /**
   * 사용자 지정 기간 내 회원가입자 수를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   * @returns 사용자 지정 기간 내 회원가입자 수
   */
  async getCustomPeriodSignupCount(startDate: string, endDate: string): Promise<number> {
    // 이번 주 가입자 수를 조회하는 경우 특별 처리
    if (startDate === 'this-week' || startDate === 'current-week') {
      // 이번 주의 월요일과 일요일 가져오기
      const today = new Date();
      const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

      // 이번 주의 월요일 가져오기 (현재가 월요일이면 오늘, 아니면 지난 월요일)
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 일요일이면 -6, 월요일이면 0, 화요일이면 -1, ...
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // 이번 주의 일요일 가져오기 (현재가 일요일이면 오늘, 아니면 다음 일요일)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      console.log(`이번 주 검색 범위: ${monday.toISOString()} ~ ${sunday.toISOString()}`);
      console.log(`월요일: ${monday.toDateString()}, 일요일: ${sunday.toDateString()}`);

      // 이번 주 가입자 수 조회
      const result = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, monday),
            lte(users.createdAt, sunday)
          )
        );

      // 디버깅을 위해 전체 사용자 수도 조회
      const totalUsers = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.deletedAt} IS NULL`);

      console.log(`전체 사용자 수: ${totalUsers[0].count}, 이번 주 가입자 수: ${result[0].count}`);

      return result[0].count;
    }

    // 일반적인 사용자 지정 기간 처리
    try {
      // 날짜 문자열을 Date 객체로 변환
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      // 디버깅을 위한 로그 추가
      console.log(`사용자 지정 기간 검색 범위: ${start.toISOString()} ~ ${end.toISOString()}`);
      console.log(`시작일: ${start.toDateString()}, 종료일: ${end.toDateString()}`);

      // 사용자 지정 기간 내 가입자 수 조회
      const result = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, start),
            lte(users.createdAt, end)
          )
        );

      // 디버깅을 위해 직접 SQL 쿼리 실행
      const rawResult = await this.drizzleService.db.execute(sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL
          AND created_at >= ${start.toISOString()}
          AND created_at <= ${end.toISOString()}
      `);

      console.log(`Raw SQL 결과: `, rawResult);
      console.log(`사용자 지정 기간 가입자 수: ${result[0].count}`);

      return result[0].count;
    } catch (error) {
      console.error('사용자 지정 기간 조회 오류:', error);
      return 0;
    }
  }

  /**
   * 사용자 지정 기간 내 일별 회원가입 추이 데이터를 조회합니다.
   * @param startDate 시작 날짜 (YYYY-MM-DD 형식)
   * @param endDate 종료 날짜 (YYYY-MM-DD 형식)
   * @returns 사용자 지정 기간 내 일별 회원가입 추이 데이터
   */
  /**
   * 성별에 따른 회원 수를 조회합니다.
   * @returns {Promise<{maleCount: number, femaleCount: number}>} 남성 회원 수와 여성 회원 수
   */
  /**
   * 대학별 회원 통계를 조회합니다.
   * @returns {Promise<Array<{universityName: string, totalCount: number, maleCount: number, femaleCount: number}>>} 대학별 회원 통계 데이터
   */
  async getUniversityStats(): Promise<Array<{universityName: string, totalCount: number, maleCount: number, femaleCount: number}>> {
    // 대학 목록 가져오기 (전체 참여 대학)
    const targetUniversities = [
      '건양대학교(메디컬캠퍼스)', // 건양대 메디컬
      '대전대학교', // 대전대
      '목원대학교', // 목원대
      '배재대학교', // 배재대
      '우송대학교', // 우송대
      '한남대학교', // 한남대
      '충남대학교', // 충남대
      'KAIST', // 카이스트
      '한밭대학교', // 한밭대
      '을지대학교', // 을지대
      '대덕대학교', // 대덕대
      '대전과학기술대학교', // 대전과기대
      '대전보건대학교', // 대전보건대
      '우송정보대학' // 우송정보대
    ];

    // 데이터베이스에 실제로 등록된 대학 목록 조회
    const registeredUniversities = await this.drizzleService.db
      .select({
        universityName: universityDetails.universityName,
      })
      .from(universityDetails)
      .where(sql`${universityDetails.deletedAt} IS NULL`)
      .groupBy(universityDetails.universityName);

    // 등록된 대학 이름 목록 추출
    const registeredUniversityNames = registeredUniversities.map(uni => uni.universityName);

    console.log('데이터베이스에 등록된 대학 목록:', registeredUniversityNames);

    // 대학 목록 합치기 (등록된 대학 + 타겟 대학 중 누락된 대학)
    const allUniversities = [...new Set([...registeredUniversityNames, ...targetUniversities])];

    console.log('최종 대학 목록:', allUniversities);

    // 대학별 전체 회원 수 조회
    const universityTotalCounts = await this.drizzleService.db
      .select({
        universityName: universityDetails.universityName,
        count: count(),
      })
      .from(universityDetails)
      .innerJoin(users, eq(universityDetails.userId, users.id))
      .where(and(
        sql`${universityDetails.deletedAt} IS NULL`,
        sql`${users.deletedAt} IS NULL`
      ))
      .groupBy(universityDetails.universityName);

    // 대학별 성별 회원 수 조회
    const universityGenderCounts = await this.drizzleService.db
      .select({
        universityName: universityDetails.universityName,
        gender: profiles.gender,
        count: count(),
      })
      .from(universityDetails)
      .innerJoin(users, eq(universityDetails.userId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(and(
        sql`${universityDetails.deletedAt} IS NULL`,
        sql`${users.deletedAt} IS NULL`,
        sql`${profiles.deletedAt} IS NULL`
      ))
      .groupBy(universityDetails.universityName, profiles.gender);

    // 모든 대학에 대한 결과 생성 (유저가 없는 대학도 포함)
    const result = allUniversities.map(universityName => {
      // 해당 대학의 전체 회원 수 찾기
      const universityData = universityTotalCounts.find(item => item.universityName === universityName);
      const totalCount = universityData?.count || 0;

      // 해당 대학의 남성 회원 수 찾기
      const maleCount = universityGenderCounts.find(
        item => item.universityName === universityName && item.gender === Gender.MALE
      )?.count || 0;

      // 해당 대학의 여성 회원 수 찾기
      const femaleCount = universityGenderCounts.find(
        item => item.universityName === universityName && item.gender === Gender.FEMALE
      )?.count || 0;

      return {
        universityName,
        totalCount,
        maleCount,
        femaleCount
      };
    });

    // 11개 참여 대학만 필터링
    const filteredResult = result.filter(uni => targetUniversities.includes(uni.universityName));

    return filteredResult;
  }

  async getGenderStats(): Promise<{maleCount: number, femaleCount: number}> {
    // 남성 회원 수 조회
    const maleResult = await this.drizzleService.db
      .select({ count: count() })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          eq(profiles.gender, Gender.MALE)
        )
      );

    // 여성 회원 수 조회
    const femaleResult = await this.drizzleService.db
      .select({ count: count() })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          sql`${users.deletedAt} IS NULL`,
          eq(profiles.gender, Gender.FEMALE)
        )
      );

    return {
      maleCount: maleResult[0].count,
      femaleCount: femaleResult[0].count
    };
  }

  async getCustomPeriodSignupTrend(startDate: string, endDate: string): Promise<SignupTrendPoint[]> {
    // 이번 주 가입자 수를 조회하는 경우 특별 처리
    if (startDate === 'this-week' || startDate === 'current-week') {
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

      console.log(`이번 주 추이 검색 범위: ${monday.toISOString()} ~ ${sunday.toISOString()}`);

      // 이번 주 내 일별 데이터 조회
      const result: SignupTrendPoint[] = [];
      const currentDate = new Date(monday);

      while (currentDate <= sunday) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const queryResult = await this.drizzleService.db
          .select({ count: count() })
          .from(users)
          .where(
            and(
              sql`${users.deletedAt} IS NULL`,
              gte(users.createdAt, dayStart),
              lte(users.createdAt, dayEnd)
            )
          );

        // 날짜 표시 형식: MM월 DD일
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const label = `${month}월 ${day}일`;

        result.push({
          label,
          count: queryResult[0].count
        });

        // 다음 날로 이동
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    }

    // 일반적인 사용자 지정 기간 처리
    try {
      // 날짜 문자열을 Date 객체로 변환
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      console.log(`사용자 지정 기간 추이 검색 범위: ${start.toISOString()} ~ ${end.toISOString()}`);
      console.log(`시작일: ${start.toDateString()}, 종료일: ${end.toDateString()}`);

      // 전체 기간 회원가입자 수 먼저 조회
      const totalResult = await this.drizzleService.db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, start),
            lte(users.createdAt, end)
          )
        );

      const totalCount = totalResult[0].count;
      console.log(`전체 기간 회원가입자 수: ${totalCount}`);

      // 사용자 데이터 조회
      const usersList = await this.drizzleService.db
        .select({
          id: users.id,
          createdAt: users.createdAt
        })
        .from(users)
        .where(
          and(
            sql`${users.deletedAt} IS NULL`,
            gte(users.createdAt, start),
            lte(users.createdAt, end)
          )
        )
        .orderBy(users.createdAt);

      console.log(`조회된 사용자 수: ${usersList.length}`);
      usersList.forEach(user => {
        console.log(`사용자 ID: ${user.id}, 가입일: ${user.createdAt.toISOString()}`);
      });

      const result: SignupTrendPoint[] = [];

      // 시작 날짜부터 종료 날짜까지 일별 데이터 조회
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dayStart = new Date(currentDate);
        dayStart.setUTCHours(0, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setUTCHours(23, 59, 59, 999);

        // 해당 날짜에 가입한 사용자 수 계산
        const dayCount = usersList.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= dayStart && userDate <= dayEnd;
        }).length;

        // 날짜 표시 형식: MM월 DD일
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const label = `${month}월 ${day}일`;

        console.log(`${label} 가입자 수: ${dayCount}`);

        result.push({
          label,
          count: dayCount
        });

        // 다음 날로 이동
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 총합 확인
      const sumOfDays = result.reduce((sum, day) => sum + day.count, 0);
      console.log(`일별 합계: ${sumOfDays}, 전체 합계: ${totalCount}`);

      // 합계가 다르면 조정
      if (sumOfDays !== totalCount) {
        console.log(`합계가 다릅니다. 조정이 필요합니다.`);
      }

      return result;
    } catch (error) {
      console.error('사용자 지정 기간 추이 조회 오류:', error);
      return [];
    }
  }
}
