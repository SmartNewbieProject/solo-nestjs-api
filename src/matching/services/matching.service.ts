import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import { ProfileService } from '@/user/services/profile.service';
import { UserPreferenceSummary, MatchType, MatchDetails, WeightedPartner } from '@/types/match';
import MatchRepository from '../repository/match.repository';
import weekDateService from '../domain/date';
import MatchResultRouter from '../domain/match-result-router';
import { MatchingStatsService } from './stats.service';
import { MatchUserHistoryManager } from '../domain/match-user-history';

export interface MatchingWeights {
  age: number;
  interests: number;
  personalities: number;
  lifestyles: number;
  mbti: number;
  embedding: number;
  tattoo: number;
  drinking: number;
  smoking: number;
}

export interface MatchingResult {
  userId: string;
  score: number;
  details: {
    ageScore: number;
    interestsScore: number;
    personalitiesScore: number;
    lifestylesScore: number;
    mbtiScore: number;
    embeddingScore: number;
    tattooScore: number;
    drinkingScore: number;
    smokingScore: number;
  };
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private readonly matchResultRouter = new MatchResultRouter();

  constructor(
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly profileService: ProfileService,
    private readonly matchRepository: MatchRepository,
    private readonly statsService: MatchingStatsService,
    private readonly matchUserHistoryManager: MatchUserHistoryManager,
  ) { }

  /**
   * 사용자에게 맞는 매칭 결과를 반환합니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   */
  async findMatches(
    userId: string,
    limit: number = 10,
    type: MatchType,
  ): Promise<WeightedPartner[]> {
    try {
      const exceptIds = await this.matchUserHistoryManager.getMatchedUserIds(userId);
      const similarProfiles = await this.profileEmbeddingService.findSimilarProfiles(userId, limit * 3, type, exceptIds);
      const weightedPartners = await this.statsService.createWeightedPartners(similarProfiles);

      return weightedPartners;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다: ${error.message}`);
        // 임베딩을 찾을 수 없는 경우 빈 배열 반환
        return [];
      }
      // 다른 예외는 그대로 전파
      throw error;
    }
  }

  async getLatestPartner(userId: string): Promise<MatchDetails> {
    const latestMatch = await this.matchRepository.findLatestMatch(userId);
    const result = await this.matchResultRouter.resolveMatchingStatus({
      latestMatch,
      onRematching: () => this.profileService.getUserProfiles(latestMatch!.matcherId!),
      onOpen: () => this.profileService.getUserProfiles(latestMatch!.matcherId!),
    });
    return result;
  }

  async getTotalMatchingCount() {
    const count = await this.matchRepository.getTotalMatchingCount();
    return { count };
  }

  getNextMatchingDate() {
    const nextMatchingDate = weekDateService.getNextMatchingDate();
    return nextMatchingDate.format('YYYY-MM-DD HH:mm:ss');
  }

  private async getUserPreferenceSummary(userId: string): Promise<UserPreferenceSummary> {
    const userProfile = await this.profileService.getUserProfiles(userId);
    const { preferences } = userProfile;

    const getFirstOption = (type: string) => preferences.find(p => p.typeName === type)?.selectedOptions[0]?.displayName;

    return {
      id: userId,
      name: userProfile.name,
      age: userProfile.age,
      mbti: getFirstOption('MBTI 유형'),
      interests: preferences.filter(p => p.typeName === '관심사').map(p => p.selectedOptions[0].displayName),
      personalities: preferences.filter(p => p.typeName === '성격 유형').map(p => p.selectedOptions[0].displayName),
      lifestyles: preferences.filter(p => p.typeName === '라이프스타일').map(p => p.selectedOptions[0].displayName),
      tattoo: getFirstOption('문신 선호도'),
      drinking: getFirstOption('음주 선호도'),
      smoking: getFirstOption('흡연 선호도'),
    };
  }

}
