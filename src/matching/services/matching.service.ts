import { Injectable, Logger } from '@nestjs/common';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import matchingPreferenceWeighter from '../domain/matching-preference-weighter';
import { ProfileService } from '@/user/services/profile.service';
import { UserPreferenceSummary, Similarity, PartnerDetails } from '@/types/match';
import MatchRepository from '../repository/match.repository';
import weekDateService from '../domain/date';

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
  
  constructor(
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly profileService: ProfileService,
    private readonly matchRepository: MatchRepository,  
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
  ): Promise<Similarity[]> {
    const { getWeights } = matchingPreferenceWeighter;
    const finalWeights: MatchingWeights = getWeights(weights);
      
    const weightSum = Object.values(finalWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(finalWeights).forEach(key => {
        finalWeights[key as keyof MatchingWeights] /= weightSum;
      });
      
    const similarProfiles = await this.profileEmbeddingService.findSimilarProfiles(userId, limit * 3);

    return similarProfiles;
  }

  async getLatestPartner(userId: string): Promise<PartnerDetails | null> {
    const partner = await this.matchRepository.findLatestPartner(userId);

    if (!partner) {
      return null;
    }

    return {
      ...partner,
      university: partner.university ? {
        department: partner.university.department,
        name: partner.university.universityName,
        grade: partner.university.grade,
        studentNumber: partner.university.studentNumber,
      } : null,
    }
  }

  async getTotalMatchingCount() {
    const count = await this.matchRepository.getTotalMatchingCount();
    this.logger.debug(`Total matching count: ${count}`);
    return {
      count,
    };
  }

  getNextMatchingDate() {
    // return weekDateService.createDayjs().add(1, 'minute').toDate();
    const nextMatchingDate = weekDateService.getNextMatchingDate();
    return nextMatchingDate.toDate();
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
