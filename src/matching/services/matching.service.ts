import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import { eq, sql } from 'drizzle-orm';
import { 
  users, 
  userPreferenceOptions, 
  userPreferences, 
  profiles, 
  preferenceOptions, 
} from '@/database/schema';
import matchingPreferenceWeighter from '../domain/matching-preference-weighter';
import { ProfileService } from '@/user/services/profile.service';
import { UserPreferenceSummary } from '@/types/match';
const { consts: { 
  MBTI_COMPATIBILITY
} } = matchingPreferenceWeighter;

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
  
  // MBTI 궁합 점수 (0~1 사이 값, 1이 가장 좋은 궁합)
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * 사용자에게 맞는 매칭 결과를 반환합니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   * @param weights 가중치 설정 (선택적)
   */
  async findMatches(
    userId: string, 
    limit: number = 10,
    weights?: Partial<MatchingWeights>
  ) {
    try {
      const { score: calculator, getWeights } = matchingPreferenceWeighter;
      const finalWeights: MatchingWeights = getWeights(weights);
      
      const weightSum = Object.values(finalWeights).reduce((sum, weight) => sum + weight, 0);
      Object.keys(finalWeights).forEach(key => {
        finalWeights[key as keyof MatchingWeights] /= weightSum;
      });
      
      const userPreferenceSummary = await this.getUserPreferenceSummary(userId);
      const similarProfiles = await this.profileEmbeddingService.findSimilarProfiles(userId, limit * 3);
      console.log(similarProfiles);

      return similarProfiles;
      
      // const matchResults = await Promise.all(
      //   similarProfiles.map(async (candidate) => {
      //     const candidatePreferenceSummary = await this.getUserPreferenceSummary(candidate.userId);
      //     const details = calculator.total(userPreferenceSummary, candidatePreferenceSummary, candidate.similarity);
      //     const score = 
      //       details.age * finalWeights.age +
      //       details.interests * finalWeights.interests +
      //       details.personalities * finalWeights.personalities +
      //       details.lifestyles * finalWeights.lifestyles +
      //       details.mbti * finalWeights.mbti +
      //       details.embedding * finalWeights.embedding;
      //     return {
      //       userId: candidate.userId,
      //       score,
      //       details: {
      //         ageScore: details.age,
      //         interestsScore: details.interests,
      //         personalitiesScore: details.personalities,
      //         lifestylesScore: details.lifestyles,
      //         mbtiScore: details.mbti,
      //         embeddingScore: details.embedding,
      //         tattooScore: details.tattoo,
      //         drinkingScore: details.drinking,
      //         smokingScore: details.smoking,
      //       }
      //     };
      //   })
      // );
      
      // return matchResults
        // .sort((a, b) => b.score - a.score)
        // .slice(0, limit);
    } catch (error) {
      this.logger.error(`매칭 검색 중 오류 발생: ${error.message}`, error.stack);
      return [];
    }
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
