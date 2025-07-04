import { Injectable } from '@nestjs/common';
import { QdrantService } from '@/config/qdrant/qdrant.service';
import { ProfileService } from '@/user/services/profile.service';
import { Gender } from '@/types/enum';
import { MatchType, UserVectorPayload } from '@/types/match';
import { VectorFilter } from '@/matching/domain/filter';
import compabilities from '@/matching/domain/compability';

interface FilterStrategy {
  must: any[];
  must_not: any[];
}

@Injectable()
export class ProfileSimilarFinderService {
  private readonly COLLECTION_NAME = 'profiles';

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly profileService: ProfileService,
  ) {}

  async findCandidates(
    userId: string,
    limit: number = 10,
    type: MatchType,
    exceptIds: string[],
  ): Promise<Array<{ userId: string; similarity: number }>> {
    const { payload, vector } = await this.getUserPoint(userId);
    const targetGender =
      payload.profileSummary.gender === Gender.MALE
        ? Gender.FEMALE
        : Gender.MALE;
    const profile = await this.profileService.getUserProfiles(userId, false);
    const mustNotIds = [userId, ...exceptIds];

    const { rankFilter, drinkFilter, smokingFilter, tattooFilter, ageFilter } =
      VectorFilter.getFilters(profile, type, targetGender);

    if (!rankFilter) {
      return [];
    }

    const initialStrategy: FilterStrategy = {
      must: [
        { key: 'type', match: { value: 'profile' } },
        { key: 'profileSummary.gender', match: { value: targetGender } },
        { key: 'profileSummary.rank', match: { any: rankFilter } },
      ],
      must_not: [{ key: 'userId', match: { any: mustNotIds } }],
    };

    if (ageFilter) {
      initialStrategy.must.push(ageFilter);
    }

    const strictFilter = [drinkFilter, smokingFilter, tattooFilter]
      .filter((r) => r !== null)
      .flat();

    if (strictFilter.length > 0) {
      initialStrategy.must_not.push({
        key: 'profileSummary.preferences[].options',
        match: { any: strictFilter },
      });
    }

    return this.findWithRelaxedFilters(
      userId,
      vector,
      profile.mbti ?? '',
      limit,
      type,
      exceptIds,
      initialStrategy,
    );
  }

  private async findWithRelaxedFilters(
    userId: string,
    vector: number[],
    userMbti: string,
    limit: number,
    type: MatchType,
    exceptIds: string[],
    filterStrategy: FilterStrategy,
    currentStep: number = 0,
  ): Promise<Array<{ userId: string; similarity: number }>> {
    const searchResults = await this.qdrantService.searchPoints(
      this.COLLECTION_NAME,
      vector,
      limit,
      filterStrategy,
    );

    if (searchResults.length > 0) {
      return this.processSearchResults(searchResults, userMbti);
    }

    if (currentStep >= 3) {
      return [];
    }

    const nextStrategy = await this.getNextFilterStrategy(
      userId,
      type,
      exceptIds,
      filterStrategy,
      currentStep + 1,
    );

    return this.findWithRelaxedFilters(
      userId,
      vector,
      userMbti,
      limit,
      type,
      exceptIds,
      nextStrategy,
      currentStep + 1,
    );
  }

  private async getNextFilterStrategy(
    userId: string,
    type: MatchType,
    exceptIds: string[],
    prevStrategy: FilterStrategy,
    step: number,
  ): Promise<FilterStrategy> {
    const profile = await this.profileService.getUserProfiles(userId, false);
    const targetGender =
      profile.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
    const { rankFilter } = VectorFilter.getFilters(profile, type, targetGender);
    const mustNotIds = [userId, ...exceptIds];

    switch (step) {
      case 1: // ageFilter 제외
        return {
          ...prevStrategy,
          must: prevStrategy.must.filter((f) => f.key !== 'profileSummary.age'),
        };
      case 2: // strictFilter 제외
        return {
          ...prevStrategy,
          must_not: prevStrategy.must_not.filter(
            (f) => f.key !== 'profileSummary.preferences[].options',
          ),
        };
      case 3: // rankFilter만 적용
        return {
          must: [
            { key: 'type', match: { value: 'profile' } },
            { key: 'profileSummary.gender', match: { value: targetGender } },
            { key: 'profileSummary.rank', match: { any: rankFilter } },
          ],
          must_not: [{ key: 'userId', match: { any: mustNotIds } }],
        };
      default:
        return prevStrategy;
    }
  }

  private async getUserPoint(userId: string) {
    const client = this.qdrantService.getClient();
    const result = await client.retrieve(this.COLLECTION_NAME, {
      ids: [userId],
      with_vector: true,
      with_payload: true,
    });
    if (result.length === 0)
      throw new Error('프로필 임베딩을 찾을 수 없습니다.');
    return {
      payload: result[0].payload as UserVectorPayload,
      vector: result[0].vector as number[],
    };
  }

  private async processSearchResults(
    searchResults: any[],
    userMbti: string,
  ): Promise<Array<{ userId: string; similarity: number }>> {
    return Promise.all(
      searchResults.map(async (result) => {
        let similarity = result.score;
        const targetUserId = result.payload?.userId as string;
        const targetMbti = (
          result.payload?.profileSummary as UserVectorPayload['profileSummary']
        )?.mbti;
        if (userMbti && targetMbti) {
          const compatibilityBonus = this.calculateMbtiCompatibility(
            userMbti,
            targetMbti,
          );
          similarity = similarity * compatibilityBonus;
        }
        return {
          userId: targetUserId,
          similarity: similarity,
        };
      }),
    );
  }

  private calculateMbtiCompatibility(
    userMbti: string,
    targetMbti: string,
  ): number {
    if (userMbti === targetMbti) {
      return 1.0;
    }

    if (compabilities.MBTI[userMbti]?.includes(targetMbti)) {
      return 1.3; // 30% 점수 보너스
    }

    return 1.0;
  }
}
