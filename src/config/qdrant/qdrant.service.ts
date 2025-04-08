import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/qdrant-js';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5초

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(retryCount = 0) {
    try {
      await this.connect();
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        this.logger.warn(`Qdrant 연결 실패. ${this.RETRY_DELAY/1000}초 후 재시도합니다. (시도 ${retryCount + 1}/${this.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        await this.connectWithRetry(retryCount + 1);
      } else {
        this.logger.error(`Qdrant 연결이 ${this.MAX_RETRIES}번의 시도 후에도 실패했습니다.`);
        throw error;
      }
    }
  }

  private async connect() {
    try {
      const host = this.configService.get<string>('QDRANT_HOST', 'localhost');
      const port = this.configService.get<number>('QDRANT_PORT', 6333);
      const apiKey = this.configService.get<string>('QDRANT_API_KEY');
      const https = this.configService.get<boolean>('QDRANT_HTTPS', false);

      this.logger.log(`Qdrant 연결 설정: host=${host}, port=${port}, https=${https}, apiKey=${apiKey ? '설정됨' : '미설정'}`);

      // URL 기반 설정으로 변경
      const url = `http://${host}:${port}`;
      this.logger.log(`Qdrant URL: ${url}`);

      this.client = new QdrantClient({
        url,
        timeout: 10000, // 10초 타임아웃 설정
        apiKey,
      });

      this.logger.log('Qdrant 클라이언트 인스턴스 생성 완료');

      // 연결 테스트
      const collections = await this.client.getCollections();
      this.logger.log(`Qdrant 연결 성공. 컬렉션 목록: ${JSON.stringify(collections)}`);
    } catch (error) {
      this.logger.error(`Qdrant 연결 실패: ${error.message}`, error.stack);
      this.logger.error(`상세 오류 정보: ${JSON.stringify(error)}`);
      throw new Error(`Qdrant 연결 실패: ${error.message}`);
    }
  }

  /**
   * Qdrant 클라이언트 인스턴스를 반환합니다.
   */
  getClient(): QdrantClient {
    if (!this.client) {
      throw new Error('Qdrant 클라이언트가 초기화되지 않았습니다.');
    }
    return this.client;
  }

  /**
   * 컬렉션이 존재하는지 확인합니다.
   * @param collectionName 컬렉션 이름
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.some(
        (collection) => collection.name === collectionName
      );
    } catch (error) {
      this.logger.error(
        `컬렉션 확인 중 오류 발생: ${error.message}`,
        error.stack
      );
      return false;
    }
  }

  /**
   * 벡터 차원에 맞는 컬렉션을 생성합니다.
   * @param collectionName 컬렉션 이름
   * @param dimension 벡터 차원
   */
  async createCollection(
    collectionName: string,
    dimension: number
  ): Promise<void> {
    try {
      const exists = await this.collectionExists(collectionName);
      if (exists) {
        this.logger.log(`컬렉션 '${collectionName}'이(가) 이미 존재합니다.`);
        return;
      }

      await this.client.createCollection(collectionName, {
        vectors: {
          size: dimension,
          distance: 'Cosine',
        },
      });

      this.logger.log(`컬렉션 '${collectionName}'이(가) 생성되었습니다.`);
    } catch (error) {
      this.logger.error(
        `컬렉션 생성 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new Error(`컬렉션 생성 실패: ${error.message}`);
    }
  }

  /**
   * 컬렉션에 포인트(벡터와 메타데이터)를 업서트합니다.
   * @param collectionName 컬렉션 이름
   * @param points 업서트할 포인트 배열
   */
  async upsertPoints(
    collectionName: string,
    points: Array<{
      id: string;
      vector: number[];
      payload?: Record<string, any>;
    }>
  ): Promise<void> {
    try {
      await this.client.upsert(collectionName, {
        points,
      });

      this.logger.log(
        `${points.length}개의 포인트가 '${collectionName}' 컬렉션에 업서트되었습니다.`
      );
    } catch (error) {
      this.logger.error(
        `포인트 업서트 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new Error(`포인트 업서트 실패: ${error.message}`);
    }
  }

  /**
   * 벡터 검색을 수행합니다.
   * @param collectionName 컬렉션 이름
   * @param vector 검색할 벡터
   * @param limit 결과 제한 수
   * @param filter 필터 조건
   */
  async searchPoints(
    collectionName: string,
    vector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ) {
    try {
      const searchParams: any = {
        vector,
        limit,
      };

      if (filter) {
        searchParams.filter = filter;
      }

      const results = await this.client.search(collectionName, searchParams);
      return results;
    } catch (error) {
      this.logger.error(
        `벡터 검색 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new Error(`벡터 검색 실패: ${error.message}`);
    }
  }
 
  /**
   * 컬렉션에서 포인트를 삭제합니다.
   * @param collectionName 컬렉션 이름
   * @param pointIds 삭제할 포인트 ID 배열
   */
  async deletePoints(
    collectionName: string,
    pointIds: string[]
  ): Promise<void> {
    try {
      await this.client.delete(collectionName, {
        points: pointIds,
      });

      this.logger.log(
        `${pointIds.length}개의 포인트가 '${collectionName}' 컬렉션에서 삭제되었습니다.`
      );
    } catch (error) {
      this.logger.error(
        `포인트 삭제 중 오류 발생: ${error.message}`,
        error.stack
      );
      throw new Error(`포인트 삭제 실패: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const collections = await this.client.getCollections();
      this.logger.log(`Qdrant 연결 테스트 성공. 컬렉션: ${JSON.stringify(collections)}`);
      return true;
    } catch (error) {
      this.logger.error(`Qdrant 연결 테스트 실패: ${error.message}`, error.stack);
      return false;
    }
  }
}
