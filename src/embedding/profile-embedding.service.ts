import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from '@/qdrant/qdrant.service';
import { DrizzleService } from '@/database/drizzle.service';
import { ProfileUpdatedEvent } from '@/events/profile-updated.event';
import { UserProfile } from '@/types/user';

@Injectable()
export class ProfileEmbeddingService {
  private readonly logger = new Logger(ProfileEmbeddingService.name);
  private readonly COLLECTION_NAME = 'profiles';
  private readonly VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small 모델의 벡터 크기

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
    private readonly drizzleService: DrizzleService,
  ) {}

  /**
   * 컬렉션을 초기화합니다.
   */
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

  /**
   * 프로필 정보를 텍스트로 변환합니다.
   * @param profile 프로필 정보
   */
  private formatProfileText(profile: UserProfile): string {
    const parts: string[] = [];

    // 기본 프로필 정보
    if (profile.name) {
      parts.push(`이름: ${profile.name}`);
    }

    if (profile.age) {
      parts.push(`나이: ${profile.age}세`);
    }

    if (profile.gender) {
      parts.push(`성별: ${profile.gender}`);
    }

    // 대학 정보
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

      // 프로필 정보를 텍스트로 변환
      const profileText = this.formatProfileText(profile);
      
      if (!profileText) {
        this.logger.warn(`사용자 ${userId}의 프로필 정보가 없습니다.`);
        return;
      }

      // 임베딩 생성
      const embedding = await this.embeddingService.createEmbedding(profileText);

      // Qdrant에 포인트 업서트
      const profileSummary = {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        preferences: (() => {
          return profile.preferences.map(pref => ({
            type: pref.typeName,
            options: pref.selectedOptions.map(opt => opt.displayName).join(', ')
          }));
        })(),
      };
  
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

  /**
   * MBTI 유형 간의 상성 정보
   * 각 MBTI 유형에 대해 상성이 좋은 유형들을 정의합니다.
   */
  private readonly mbtiCompatibility = {
    'INTJ': ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
    'INTP': ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTP', 'ENTP'],
    'ENTJ': ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'INTJ'],
    'ENTP': ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTP', 'INTP'],
    'INFJ': ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
    'INFP': ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTJ', 'INTP'],
    'ENFJ': ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
    'ENFP': ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
    'ISTJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'ESTJ': ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'ESFJ': ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'ISTP': ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
    'ISFP': ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
    'ESTP': ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
    'ESFP': ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  };

  /**
   * 유사한 프로필을 검색합니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   */
  async findSimilarProfiles(userId: string, limit: number = 10): Promise<Array<{ userId: string; similarity: number }>> {
    try {
      // 컬렉션 존재 여부 확인
      const collections = await this.qdrantService.getClient().getCollections();
      const collectionExists = collections.collections.some(c => c.name === this.COLLECTION_NAME);
      
      if (!collectionExists) {
        this.logger.warn(`${this.COLLECTION_NAME} 컬렉션이 존재하지 않습니다. 컬렉션을 초기화합니다.`);
        await this.initializeCollection();
        return [];
      }
      
      try {
        // 사용자 프로필 임베딩 가져오기
        const client = this.qdrantService.getClient();
        const result = await client.retrieve(this.COLLECTION_NAME, {
          ids: [userId],
          with_vector: true,
          with_payload: true
        });

        if (result.length === 0) {
          this.logger.log(`사용자 ${userId}의 프로필 임베딩을 찾을 수 없습니다.`);
          return [];
        }

        // 벡터 타입 검사 및 변환
        const vector = result[0].vector;
        if (!vector || !Array.isArray(vector)) {
          this.logger.error(`사용자 ${userId}의 프로필 벡터가 유효하지 않습니다.`);
          return [];
        }

        // 사용자의 MBTI 정보 가져오기
        const userMbti = this.getUserMbti(result[0].payload?.profileSummary);

        // 유사한 프로필 검색
        const searchResults = await this.qdrantService.searchPoints(
          this.COLLECTION_NAME,
          vector as number[],
          limit + 1, // 자기 자신도 포함될 수 있으므로 +1
          {
            must: [
              {
                key: 'type',
                match: {
                  value: 'profile',
                },
              },
            ],
            must_not: [
              {
                key: 'userId',
                match: {
                  value: userId,
                },
              },
            ],
          }
        );

        // 결과 변환 (상성 점수 반영)
        const results = await Promise.all(searchResults.map(async (result) => {
          // 기본 유사도 점수
          let similarity = result.score;
          
          // 대상의 MBTI 정보 가져오기
          const targetUserId = result.payload?.userId as string;
          const targetMbti = this.getUserMbti(result.payload?.profileSummary);
          
          // MBTI 상성 반영
          if (userMbti && targetMbti) {
            const compatibilityBonus = this.calculateMbtiCompatibility(userMbti, targetMbti);
            similarity = similarity * compatibilityBonus;
          }
          
          return {
            userId: targetUserId,
            similarity: similarity,
          };
        }));
        
        // 점수 순으로 정렬
        return results.sort((a, b) => b.similarity - a.similarity);
      } catch (error) {
        console.error(error);
        this.logger.error(`프로필 임베딩 검색 중 오류 발생: ${error.message}`, error.stack);
        return [];
      }
    } catch (error) {
      console.error(error);
      this.logger.error(`유사 프로필 검색 중 오류 발생: ${error.message}`, error.stack);
      return [];
    }
  }
  
  /**
   * 프로필 정보에서 MBTI 유형을 추출합니다.
   * @param profileSummary 프로필 정보
   * @returns MBTI 유형 또는 null
   */
  private getUserMbti(profileSummary: any): string | null {
    if (!profileSummary || !profileSummary.preferences) {
      return null;
    }
    
    // 선호도 정보에서 MBTI 유형 찾기
    for (const pref of profileSummary.preferences) {
      if (pref.type === 'MBTI 유형') {
        // 코드에서는 전체 옵션이 문자열로 저장되어 있으므로 처리
        const mbtiOptions = pref.options;
        if (mbtiOptions) {
          // MBTI 패턴에 맞는 값 추출
          const mbtiMatch = mbtiOptions.match(/ENFP|ENFJ|INFP|INFJ|ENTP|ENTJ|INTP|INTJ|ESFP|ESFJ|ISFP|ISFJ|ESTP|ESTJ|ISTP|ISTJ/);
          if (mbtiMatch) {
            return mbtiMatch[0];
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * 두 MBTI 유형 간의 상성을 계산합니다.
   * @param userMbti 사용자의 MBTI 유형
   * @param targetMbti 대상의 MBTI 유형
   * @returns 상성 가중치 (1.0 ~ 1.3)
   */
  private calculateMbtiCompatibility(userMbti: string, targetMbti: string): number {
    // 두 MBTI가 동일한 경우 상성 보너스 적용
    if (userMbti === targetMbti) {
      return 1.2; // 20% 점수 보너스
    }
    
    // 상성표에 있는 경우 상성 보너스 적용
    if (this.mbtiCompatibility[userMbti]?.includes(targetMbti)) {
      return 1.3; // 30% 점수 보너스
    }
    
    // 상성표에 없는 경우 기본 가중치
    return 1.0;
  }
}
