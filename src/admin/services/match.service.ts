import { Injectable } from '@nestjs/common';
import { MatchingService } from '@/matching/services/matching.service';
import AdminMatchRepository from '../repositories/match.repository';
import {
  AdminMatchRequest,
  AdminMatchSimulationRequest,
} from '@/matching/dto/matching';
import { ProfileService } from '@/user/services/profile.service';
import { PaginatedResponse, Pagination } from '@/types/common';
import { MatchType, Similarity, UnmatchedUser } from '@/types/match';
import { Gender } from '@/types/enum';
import weekDateService from '@/matching/domain/date';
import dayjs from 'dayjs';
import { choiceRandom } from '@/matching/domain/random';

interface MatchStats {
  totalMatchRate: number;
  maleMatchRate?: number;
  femaleMatchRate?: number;
}

@Injectable()
export default class AdminMatchService {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly profileService: ProfileService,
    private readonly adminMatchRepository: AdminMatchRepository,
  ) {}

  // 기존 findMatches 메서드는 simulateMatching으로 대체됨

  async getUnmatchedUsers(
    pagination: Pagination,
  ): Promise<PaginatedResponse<UnmatchedUser>> {
    return await this.adminMatchRepository.getUnmatchedUsers(pagination);
  }

  async getMatchStats(publishedAt: Date, gender?: Gender): Promise<MatchStats> {
    const date = new Date(publishedAt);
    weekDateService.createDayjs();
    date.setHours(21, 0, 0, 0);
    date.setHours(date.getHours() + 9);

    const totalCount = await this.adminMatchRepository.getTotalMatchCount(date);

    if (!totalCount) {
      return {
        totalMatchRate: 0,
        ...(gender === Gender.MALE ? { maleMatchRate: 0 } : {}),
        ...(gender === Gender.FEMALE ? { femaleMatchRate: 0 } : {}),
        ...(!gender ? { maleMatchRate: 0, femaleMatchRate: 0 } : {}),
      };
    }

    const stats: MatchStats = {
      totalMatchRate: 100,
    };

    if (!gender || gender === Gender.MALE) {
      const maleCount = await this.adminMatchRepository.getGenderMatchCount(
        date,
        Gender.MALE,
      );
      stats.maleMatchRate = (maleCount / totalCount) * 100;
    }

    if (!gender || gender === Gender.FEMALE) {
      const femaleCount = await this.adminMatchRepository.getGenderMatchCount(
        date,
        Gender.FEMALE,
      );
      stats.femaleMatchRate = (femaleCount / totalCount) * 100;
    }

    return stats;
  }

  /**
   * 매칭 시뮬레이션을 수행합니다. 실제 매칭과 동일한 로직을 사용하지만 데이터베이스에 저장하지 않습니다.
   * @param request 매칭 시뮬레이션 요청 (AdminMatchRequest 또는 AdminMatchSimulationRequest)
   * @returns 매칭 시뮬레이션 결과
   */
  async simulateMatching(
    request: AdminMatchRequest | AdminMatchSimulationRequest,
  ) {
    const { userId, limit = 5 } = request;

    // 매칭 가능한 파트너 찾기 (limit보다 많은 결과를 가져와서 나중에 제한)
    // 다양한 결과를 얻기 위해 더 많은 후보를 가져옴
    const similarUsers = await this.matchingService.findMatches(
      userId,
      Math.max(limit * 2, 10),
      MatchType.ADMIN,
    );

    if (similarUsers.length === 0) {
      return {
        success: false,
        message: '매칭 가능한 파트너가 없습니다.',
        requester: null,
        potentialPartners: [],
      };
    }

    // 요청자 프로필 조회
    const requester = await this.profileService.getUserProfiles(userId);

    // 파트너 프로필 조회
    const partnerIds = similarUsers.map((user) => user.userId);
    const partnerProfiles =
      await this.profileService.getProfilesByIds(partnerIds);

    // 파트너 정보와 유사도 점수 결합
    let potentialPartners = similarUsers.map((similarUser) => {
      const profile = partnerProfiles.find((p) => p.id === similarUser.userId);
      return {
        profile,
        similarity: similarUser.similarity,
      };
    });

    // 결과를 섞어서 매번 다른 결과가 나오도록 함
    potentialPartners = this.shuffleArray(potentialPartners);

    // 요청한 limit 개수로 제한
    potentialPartners = potentialPartners.slice(0, limit);

    // 무작위로 하나의 파트너 선택 (실제 매칭과 동일한 로직)
    const selectedPartner =
      potentialPartners.length > 0 ? choiceRandom(potentialPartners) : null;

    return {
      success: true,
      message: '매칭 시뮬레이션이 성공적으로 수행되었습니다.',
      requester,
      potentialPartners,
      selectedPartner,
    };
  }

  // 배열을 무작위로 섞는 함수 (Fisher-Yates 알고리즘)
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
