import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import { ProfileService } from '@/user/services/profile.service';
import {
  UserPreferenceSummary,
  MatchType,
  MatchDetails,
  WeightedPartner,
} from '@/types/match';
import MatchRepository from '../repository/match.repository';
import weekDateService from '../domain/date';
import MatchResultRouter from '../domain/match-result-router';
import { MatchingStatsService } from './stats.service';
import { MatchUserHistoryManager } from '../domain/match-user-history';
import { ProfileSimilarFinderService } from '@/embedding/services/profile-similar-finder.service';

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
    private readonly profileSimilarFinderService: ProfileSimilarFinderService,
  ) {}

  async findMatches(
    userId: string,
    limit: number = 10,
    type: MatchType,
  ): Promise<WeightedPartner[]> {
    try {
      const exceptIds =
        await this.matchUserHistoryManager.getMatchedUserIds(userId);
      const similarProfiles =
        await this.profileSimilarFinderService.findCandidates(
          userId,
          limit * 3,
          type,
          exceptIds,
        );
      const weightedPartners =
        await this.statsService.createWeightedPartners(similarProfiles);

      return weightedPartners;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다: ${error.message}`,
        );
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
      onRematching: () =>
        this.profileService.getUserProfiles(latestMatch!.matcherId!),
      onOpen: () =>
        this.profileService.getUserProfiles(latestMatch!.matcherId!),
    });

    // 재매칭이 만료된 경우 자동매칭 결과 확인
    if (result.type === 'waiting' && latestMatch?.type === 'rematching') {
      this.logger.debug(`재매칭 만료됨 - 자동매칭 결과 확인 중`);
      const scheduledMatch =
        await this.matchRepository.findLatestScheduledMatch(userId);

      if (scheduledMatch) {
        this.logger.debug(`재매칭 만료 후 자동매칭 결과 반환`);
        return await this.matchResultRouter.resolveMatchingStatus({
          latestMatch: scheduledMatch,
          onRematching: () =>
            this.profileService.getUserProfiles(scheduledMatch.matcherId!),
          onOpen: () =>
            this.profileService.getUserProfiles(scheduledMatch.matcherId!),
        });
      } else {
        // 자동매칭 결과가 없는 경우 매칭 실패로 처리
        this.logger.debug(`재매칭 만료 후 자동매칭 결과 없음 - 매칭 실패 처리`);
        const nextMatchingDate = weekDateService.getNextMatchingDate();
        return {
          id: null,
          endOfView: null,
          partner: null,
          type: 'not-found',
          untilNext: nextMatchingDate.format('YYYY-MM-DD HH:mm:ss'),
        };
      }
    }

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

  private async getUserPreferenceSummary(
    userId: string,
  ): Promise<UserPreferenceSummary> {
    const userProfile = await this.profileService.getUserProfiles(userId);
    const { preferences } = userProfile;

    const getFirstOption = (type: string) =>
      preferences.find((p) => p.typeName === type)?.selectedOptions[0]
        ?.displayName;

    return {
      id: userId,
      name: userProfile.name,
      age: userProfile.age,
      mbti: getFirstOption('MBTI 유형'),
      interests: preferences
        .filter((p) => p.typeName === '관심사')
        .map((p) => p.selectedOptions[0].displayName),
      personalities: preferences
        .filter((p) => p.typeName === '성격 유형')
        .map((p) => p.selectedOptions[0].displayName),
      lifestyles: preferences
        .filter((p) => p.typeName === '라이프스타일')
        .map((p) => p.selectedOptions[0].displayName),
      tattoo: getFirstOption('문신 선호도'),
      drinking: getFirstOption('음주 선호도'),
      smoking: getFirstOption('흡연 선호도'),
    };
  }
}
