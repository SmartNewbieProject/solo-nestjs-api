import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from '@/config/qdrant/qdrant.service';
import { DrizzleService } from '@/database/drizzle.service';
import { ProfileUpdatedEvent } from '@/events/profile-updated.event';
import { UserProfile } from '@/types/user';
import { Gender } from '@/types/enum';
import compabilities from '@/matching/domain/compability';
import { ProfileService } from '@/user/services/profile.service';
import { MatchType, UserVectorPayload } from '@/types/match';
import { VectorFilter } from '../matching/domain/filter';
import { UserRank } from '@/database/schema/profiles';
import { PreferencePrioritizer } from './domain/preference-prioritizer';
import { EmbeddingWeightConfig } from './domain/embedding-weight-config';

@Injectable()
export class ProfileEmbeddingService {
  private readonly logger = new Logger(ProfileEmbeddingService.name);
  private readonly COLLECTION_NAME = 'profiles';
  private readonly VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small 모델의 벡터 크기

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
    private readonly profileService: ProfileService,
  ) {}

  async initializeCollection(): Promise<void> {
    try {
      const exists = await this.qdrantService.collectionExists(
        this.COLLECTION_NAME,
      );
      if (!exists) {
        await this.qdrantService.createCollection(
          this.COLLECTION_NAME,
          this.VECTOR_SIZE,
        );
        this.logger.log(`'${this.COLLECTION_NAME}' 컬렉션이 생성되었습니다.`);
      } else {
        this.logger.log(`'${this.COLLECTION_NAME}' 컬렉션이 이미 존재합니다.`);
      }
    } catch (error) {
      this.logger.error(
        `컬렉션 초기화 중 오류 발생: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 프로필 임베딩을 생성하고 저장합니다.
   * @param userId 사용자 ID
   * @param profile 프로필 정보
   */
  async generateProfileEmbedding(
    userId: string,
    profile: UserProfile,
  ): Promise<void> {
    try {
      this.logger.log(`사용자 ${userId}의 프로필 임베딩 생성을 시작합니다.`);
      this.logger.log(
        `프로필 정보 - 이름: ${profile.name}, 나이: ${profile.age}, 성별: ${profile.gender}, 랭크: ${profile.rank}, MBTI: ${profile.mbti}`,
      );

      await this.initializeCollection();
      const profilePrioritizer = new PreferencePrioritizer(
        EmbeddingWeightConfig.getDefaultWeights(),
      );
      const profileText = profilePrioritizer.extract(profile);
      this.logger.debug('profileText');
      this.logger.debug(profileText);

      const embedding =
        await this.embeddingService.createEmbedding(profileText);

      const profileSummary = {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        rank: profile.rank,
        mbti: profile.mbti,
        preferences: profile.preferences.map((pref) => ({
          type: pref.typeName,
          options: pref.selectedOptions.map((opt) => opt.displayName),
        })),
      };

      this.logger.log(`프로필 요약 정보 - 랭크: ${profileSummary.rank}`);
      this.logger.debug(profileSummary);

      await this.qdrantService.upsertPoints(this.COLLECTION_NAME, [
        {
          id: userId,
          vector: embedding,
          payload: {
            userId,
            profileSummary,
            type: 'profile',
            createdAt: new Date().toISOString(),
          },
        },
      ]);

      this.logger.log(`사용자 ${userId}의 프로필 임베딩이 생성되었습니다.`);
    } catch (error) {
      this.logger.error(`프로필 임베딩 생성 중 오류 발생: ${error}`);
    }
  }

  @OnEvent('profile.updated')
  async handleProfileUpdatedEvent(event: ProfileUpdatedEvent): Promise<void> {
    this.logger.log(
      `사용자 ${event.userId}의 프로필 업데이트 이벤트를 처리합니다.`,
    );
    await this.generateProfileEmbedding(event.userId, event.profile);
  }

  async getUserPoint(userId: string) {
    const client = this.qdrantService.getClient();
    const result = await client.retrieve(this.COLLECTION_NAME, {
      ids: [userId],
      with_vector: true,
      with_payload: true,
    });

    if (result.length === 0) {
      this.logger.log(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`);
      throw new NotFoundException(
        `사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`,
      );
    }

    const vector = result[0].vector;
    if (!vector || !Array.isArray(vector)) {
      this.logger.error(`사용자 ${userId}의 프로필 벡터가 유효하지 않습니다.`);
      throw new NotFoundException(
        `사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`,
      );
    }

    const payload = result[0].payload as UserVectorPayload;

    return {
      vector,
      payload,
    };
  }

  /**
   * 유사한 프로필을 검색합니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   * @param gender 성별 필터 (선택적)
   */
  async findSimilarProfiles(
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
    this.logger.debug(`[mustNotIds]: ${mustNotIds}`);

    const { rankFilter, drinkFilter, smokingFilter, tattooFilter, ageFilter } =
      VectorFilter.getFilters(profile, type, targetGender);
    // this.logger.debug({ type }, { rankFilter }, smokingFilter, tattooFilter, { drinkFilter }, { ageFilter });

    if (!rankFilter) {
      return [];
    }

    const filter = {
      must: [
        {
          key: 'type',
          match: {
            value: 'profile',
          },
        },
        {
          key: 'profileSummary.gender',
          match: {
            value: targetGender,
          },
        },
        {
          key: 'profileSummary.rank',
          match: {
            any: rankFilter,
          },
        },
        // {
        //   key: 'profileSummary.preferences[].options',
        //   match: {
        //     any: [...drinkFilter, ...smokingFilter, ...tattooFilter],
        //   }
        // }
      ],
      must_not: [
        {
          key: 'userId',
          match: {
            any: mustNotIds,
          },
        },
      ],
    };

    if (ageFilter) {
      filter.must.push(ageFilter);
    }

    const strictFilter = [drinkFilter, smokingFilter, tattooFilter]
      .filter((r) => r !== null)
      .flat();

    if (strictFilter.length > 0) {
      filter.must_not.push({
        key: 'profileSummary.preferences[].options',
        match: {
          any: strictFilter,
        },
      });
    }

    const searchResults = await this.qdrantService.searchPoints(
      this.COLLECTION_NAME,
      vector as number[],
      limit,
      filter,
    );

    const results = await Promise.all(
      searchResults.map(async (result) => {
        let similarity = result.score;
        const targetUserId = result.payload?.userId as string;
        const mbti = profile.mbti;
        const targetMbti = (
          result.payload?.profileSummary as UserVectorPayload['profileSummary']
        )?.mbti;

        if (mbti && targetMbti) {
          const compatibilityBonus = this.calculateMbtiCompatibility(
            mbti,
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

    return results.sort((a, b) => b.similarity - a.similarity);
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
