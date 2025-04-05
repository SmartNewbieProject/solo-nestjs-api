import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { DrizzleService } from '@/database/drizzle.service';
import { QdrantService } from '@/qdrant/qdrant.service';
import { preferenceOptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class InterestEmbeddingService {
  private readonly logger = new Logger(InterestEmbeddingService.name);
  private readonly INTEREST_TYPE_ID = '4cb7f832-9bbf-42d7-bf39-b1f21f8a8095'; // 관심사 타입 ID
  private readonly COLLECTION_NAME = 'interest_embeddings';
  private readonly VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small 모델의 벡터 크기

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly drizzleService: DrizzleService,
    private readonly qdrantService: QdrantService,
  ) {}

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
   * 모든 관심사 옵션에 대한 임베딩을 생성하고 저장합니다.
   */
  async generateAllInterestEmbeddings(): Promise<void> {
    const db = this.drizzleService.db;
    
    // 관심사 타입의 모든 옵션 가져오기
    const interestOptions = await db
      .select()
      .from(preferenceOptions)
      .where(eq(preferenceOptions.preferenceTypeId, this.INTEREST_TYPE_ID));
    
    this.logger.log(`${interestOptions.length}개의 관심사 옵션에 대한 임베딩을 생성합니다.`);
    
    // Qdrant 컬렉션 초기화
    await this.initializeCollection();
    
    // 각 관심사에 대한 임베딩 생성
    const points = [] as any[];
    
    for (const option of interestOptions) {
      try {
        // 임베딩 생성
        const embedding = await this.embeddingService.createEmbedding(option.displayName);
        
        points.push({
          id: option.id.toString(),
          vector: embedding,
          payload: {
            optionId: option.id,
            displayName: option.displayName,
            value: option.value,
            preferenceTypeId: option.preferenceTypeId,
            createdAt: new Date().toISOString(),
          },
        });
        
        this.logger.log(`관심사 '${option.displayName}'의 임베딩이 생성되었습니다.`);
      } catch (error) {
        this.logger.error(`관심사 '${option.displayName}'의 임베딩 생성 중 오류 발생: ${error.message}`, error.stack);
      }
    }
    
    // 생성된 포인트를 Qdrant에 업서트
    if (points.length > 0) {
      await this.qdrantService.upsertPoints(this.COLLECTION_NAME, points);
      this.logger.log(`${points.length}개의 관심사 임베딩이 Qdrant에 저장되었습니다.`);
    }
    
    this.logger.log('모든 관심사 임베딩 생성이 완료되었습니다.');
  }

  /**
   * 특정 관심사 옵션의 임베딩을 생성하고 저장합니다.
   * @param optionId 관심사 옵션 ID
   */
  async generateInterestEmbedding(optionId: string): Promise<void> {
    const db = this.drizzleService.db;
    
    // 관심사 옵션 정보 가져오기
    const option = await db
      .select()
      .from(preferenceOptions)
      .where(
        and(
          eq(preferenceOptions.id, optionId),
          eq(preferenceOptions.preferenceTypeId, this.INTEREST_TYPE_ID)
        )
      )
      .limit(1);
    
    if (option.length === 0) {
      throw new Error(`ID가 ${optionId}인 관심사 옵션을 찾을 수 없습니다.`);
    }
    
    // Qdrant 컬렉션 초기화
    await this.initializeCollection();
    
    // 임베딩 생성
    const embedding = await this.embeddingService.createEmbedding(option[0].displayName);
    
    // Qdrant에 포인트 업서트
    await this.qdrantService.upsertPoints(this.COLLECTION_NAME, [
      {
        id: optionId.toString(), // ID를 문자열로 변환
        vector: embedding,
        payload: {
          optionId: option[0].id,
          displayName: option[0].displayName,
          value: option[0].value,
          preferenceTypeId: option[0].preferenceTypeId,
          createdAt: new Date().toISOString(),
        },
      },
    ]);
    
    this.logger.log(`관심사 '${option[0].displayName}'의 임베딩이 생성되었습니다.`);
  }

  /**
   * 사용자의 관심사 임베딩을 생성하고 저장합니다.
   * @param userId 사용자 ID
   * @param interestNames 사용자의 관심사 이름 배열
   */
  async generateUserInterestEmbedding(userId: string, interestNames: string[]): Promise<void> {
    if (interestNames.length === 0) {
      this.logger.log(`사용자 ${userId}의 관심사가 없습니다.`);
      return;
    }
    
    // Qdrant 컬렉션 초기화
    await this.initializeCollection();
    
    // 모든 관심사를 하나의 문자열로 결합
    const combinedInterests = interestNames.join(', ');
    
    // 임베딩 생성
    const embedding = await this.embeddingService.createEmbedding(combinedInterests);
    
    // Qdrant에 포인트 업서트
    await this.qdrantService.upsertPoints(this.COLLECTION_NAME, [
      {
        id: `user_${userId}`, // 이미 문자열 형태이므로 변환 없이 사용
        vector: embedding,
        payload: {
          userId,
          interests: interestNames,
          type: 'user',
          createdAt: new Date().toISOString(),
        },
      },
    ]);
    
    this.logger.log(`사용자 ${userId}의 관심사 임베딩이 생성되었습니다.`);
  }

  /**
   * 사용자의 관심사와 유사한 다른 사용자를 찾습니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   */
  async findSimilarUsers(userId: string, limit: number = 10): Promise<Array<{ userId: string; similarity: number }>> {
    // 사용자 임베딩 가져오기
    const userVector = await this.getUserVector(userId);
    if (!userVector) {
      this.logger.log(`사용자 ${userId}의 임베딩을 찾을 수 없습니다.`);
      return [];
    }
    
    // 유사한 사용자 검색
    const results = await this.qdrantService.searchPoints(
      this.COLLECTION_NAME,
      userVector,
      limit + 1, // 자기 자신도 포함될 수 있으므로 +1
      {
        must: [
          {
            key: 'type',
            match: {
              value: 'user',
            },
          },
        ],
      }
    );
    
    // 자기 자신 제외
    const similarUsers = results
      .filter(result => result.payload?.userId !== userId)
      .map(result => ({
        userId: result.payload?.userId as string,
        similarity: result.score,
      }));
    
    return similarUsers.slice(0, limit);
  }

  /**
   * 사용자의 관심사와 유사한 관심사 옵션을 찾습니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   */
  async findSimilarInterests(userId: string, limit: number = 10): Promise<Array<{ optionId: string; displayName: string; similarity: number }>> {
    // 사용자 임베딩 가져오기
    const userVector = await this.getUserVector(userId);
    if (!userVector) {
      this.logger.log(`사용자 ${userId}의 임베딩을 찾을 수 없습니다.`);
      return [];
    }
    
    // 유사한 관심사 검색
    const results = await this.qdrantService.searchPoints(
      this.COLLECTION_NAME,
      userVector,
      limit,
      {
        must_not: [
          {
            key: 'type',
            match: {
              value: 'user',
            },
          },
        ],
      }
    );
    
    return results.map(result => ({
      optionId: result.payload?.optionId as string,
      displayName: result.payload?.displayName as string,
      similarity: result.score,
    }));
  }

  /**
   * 사용자의 벡터를 가져옵니다.
   * @param userId 사용자 ID
   */
  private async getUserVector(userId: string): Promise<number[] | null> {
    try {
      const client = this.qdrantService.getClient();
      const result = await client.retrieve(this.COLLECTION_NAME, {
        ids: [`user_${userId}`], // 이미 문자열 형태이므로 변환 없이 사용
        with_vector: true, // with_vectors가 아닌 with_vector 사용
      });
      
      if (result.length === 0) {
        return null;
      }
      
      // 벡터 타입 검사 및 변환
      const vector = result[0].vector;
      if (!vector || !Array.isArray(vector)) {
        return null;
      }
      
      return vector as number[];
    } catch (error) {
      this.logger.error(`사용자 벡터 가져오기 중 오류 발생: ${error.message}`, error.stack);
      return null;
    }
  }
}
