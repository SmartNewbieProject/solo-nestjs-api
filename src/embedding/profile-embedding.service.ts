
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

@Injectable()
export class ProfileEmbeddingService {
  private readonly logger = new Logger(ProfileEmbeddingService.name);
  private readonly COLLECTION_NAME = 'profiles';
  private readonly VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small 모델의 벡터 크기

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
    private readonly drizzleService: DrizzleService,
    private readonly profileService: ProfileService,
  ) { }

  async initializeCollection(): Promise<void> {
    try {
      const exists = await this.qdrantService.collectionExists(this.COLLECTION_NAME);
      if (!exists) {
        await this.qdrantService.createCollection(this.COLLECTION_NAME, this.VECTOR_SIZE);
        this.logger.log(`'${this.COLLECTION_NAME}' 컬렉션이 생성되었습니다.`);
      } else {
        this.logger.log(`'${this.COLLECTION_NAME}' 컬렉션이 이미 존재합니다.`);
      }
    } catch (error) {
      this.logger.error(`컬렉션 초기화 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  formatProfileText(profile: UserProfile): string {
    const parts: string[] = [];

    if (profile.age) {
      parts.push(`나이: ${profile.age}세`);
    }

    if (profile.gender) {
      parts.push(`성별: ${profile.gender}`);
    }

    if (profile.mbti) {
      parts.push(`MBTI: ${profile.mbti}`);
    }

    if (profile.universityDetails) {
      parts.push(`대학: ${profile.universityDetails.name}`);
      if (profile.universityDetails.department) {
        parts.push(`학과: ${profile.universityDetails.department}`);
      }
    }

    // 선호도 정보 추가 (각 유형별로 선택된 옵션들을 그룹화)
    if (profile.preferences && Array.isArray(profile.preferences)) {
      profile.preferences.forEach(pref => {
        if (pref.selectedOptions && pref.selectedOptions.length > 0) {
          const optionNames = pref.selectedOptions.map(opt => opt.displayName).join(', ');
          parts.push(`${pref.typeName}: ${optionNames}`);
        }
      });
    }

    return parts.join('\n');
  }

  /**
   * 프로필 임베딩을 생성하고 저장합니다.
   * @param userId 사용자 ID
   * @param profile 프로필 정보
   */
  async generateProfileEmbedding(userId: string, profile: UserProfile): Promise<void> {
    try {
      // 컬렉션 초기화
      await this.initializeCollection();

      const profileText = this.formatProfileText(profile);
      const embedding = await this.embeddingService.createEmbedding(profileText);

      const profileSummary = {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        rank: profile.rank,
        mbti: profile.mbti,
        university: profile.universityDetails?.name,
        preferences: (() => {
          return profile.preferences.map(pref => ({
            type: pref.typeName,
            options: pref.selectedOptions.map(opt => opt.displayName),
          }));
        })(),
      };

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
      this.logger.error(`프로필 임베딩 생성 중 오류 발생: ${error.message}`, error.stack);
    }
  }

  /**
   * 프로필 업데이트 이벤트 핸들러
   * @param event 프로필 업데이트 이벤트
   */
  @OnEvent('profile.updated')
  async handleProfileUpdatedEvent(event: ProfileUpdatedEvent): Promise<void> {
    this.logger.log(`사용자 ${event.userId}의 프로필 업데이트 이벤트를 처리합니다.`);
    await this.generateProfileEmbedding(event.userId, event.profile);
  }

  async getUserPoint(userId: string) {
    const client = this.qdrantService.getClient();
    const result = await client.retrieve(this.COLLECTION_NAME, {
      ids: [userId],
      with_vector: true,
      with_payload: true
    });

    if (result.length === 0) {
      this.logger.log(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`);
      throw new NotFoundException(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`);
    }

    const vector = result[0].vector;
    if (!vector || !Array.isArray(vector)) {
      this.logger.error(`사용자 ${userId}의 프로필 벡터가 유효하지 않습니다.`);
      throw new NotFoundException(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`);
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
  async findSimilarProfiles(userId: string, limit: number = 10, type: MatchType): Promise<Array<{ userId: string; similarity: number }>> {
    const { payload, vector } = await this.getUserPoint(userId);
    const gender = payload.profileSummary.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
    const profile = await this.profileService.getUserProfiles(userId);

    const mbti = profile.preferences.find(pref => pref.typeName === 'MBTI 유형')?.selectedOptions?.[0].displayName;

    const { rankFilter, drinkFilter, smokingFilter, tattooFilter } = VectorFilter.getFilters(profile, type === MatchType.REMATCHING);

    if ([rankFilter].some(v => !v) && type !== MatchType.REMATCHING) {
      return [];
    }

    if ([rankFilter].some(v => !v) && type !== MatchType.ADMIN) {
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
            value: gender,
          },
        },
        {
          key: 'profileSummary.rank',
          match: {
            any: rankFilter || [],
          }
        },
        {
          key: 'profileSummary.preferences[].options',
          match: {
            any: [...drinkFilter, ...smokingFilter, ...tattooFilter],
          }
        }
      ],
      must_not: [
        {
          key: 'userId',
          match: {
            value: userId,
          },
        },
      ],
    };

    // 유사한 프로필 검색
    const searchResults = await this.qdrantService.searchPoints(
      this.COLLECTION_NAME,
      vector as number[],
      limit,
      filter
    );

    // this.logger.log(searchResults);

    // 결과 변환 (상성 점수 반영)
    const results = await Promise.all(searchResults.map(async (result) => {
      let similarity = result.score;
      const targetUserId = result.payload?.userId as string;
      const targetMbti = this.getUserMbti(result.payload?.profileSummary as UserVectorPayload['profileSummary']);

      // MBTI 상성 반영
      if (mbti && targetMbti) {
        const compatibilityBonus = this.calculateMbtiCompatibility(mbti, targetMbti);
        similarity = similarity * compatibilityBonus;
      }

      return {
        userId: targetUserId,
        similarity: similarity,
      };
    }));

    // 점수 순으로 정렬
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 프로필 정보에서 MBTI 유형을 추출합니다.
   * @param profileSummary 프로필 정보
   * @returns MBTI 유형 또는 null
   */
  private getUserMbti(profileSummary: UserVectorPayload['profileSummary']): string | null {
    if (!profileSummary || !profileSummary.preferences) {
      return null;
    }

    // 선호도 정보에서 MBTI 유형 찾기
    for (const pref of profileSummary.preferences) {
      if (pref.typeName === 'MBTI 유형') {
        // 코드에서는 전체 옵션이 문자열로 저장되어 있으므로 처리
        const mbtiOptions = pref.options;
        if (mbtiOptions) {
          // MBTI 패턴에 맞는 값 추출
          const mbtiMatch = mbtiOptions.find(option => option.match(/ENFP|ENFJ|INFP|INFJ|ENTP|ENTJ|INTP|INTJ|ESFP|ESFJ|ISFP|ISFJ|ESTP|ESTJ|ISTP|ISTJ/));
          if (mbtiMatch) {
            return mbtiMatch;
          }
        }
      }
    }

    return null;
  }

  private calculateMbtiCompatibility(userMbti: string, targetMbti: string): number {
    if (userMbti === targetMbti) {
      return 1.0;
    }

    if (compabilities.MBTI[userMbti]?.includes(targetMbti)) {
      return 1.3; // 30% 점수 보너스
    }

    return 1.0;
  }
}
