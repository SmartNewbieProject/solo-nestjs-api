import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API 키가 설정되지 않았습니다. 임베딩 기능이 작동하지 않을 수 있습니다.');
    }

    this.openai = new OpenAI({
      apiKey,
    });
    
    this.model = this.configService.get<string>('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');
    this.logger.log(`임베딩 모델: ${this.model}`);
  }

  /**
   * 텍스트를 임베딩 벡터로 변환합니다.
   * @param text 임베딩할 텍스트
   * @returns 임베딩 벡터
   */
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`임베딩 생성 중 오류 발생: ${error.message}`, error.stack);
      throw new Error(`임베딩을 생성할 수 없습니다: ${error.message}`);
    }
  }

  /**
   * 여러 텍스트를 한 번에 임베딩 벡터로 변환합니다.
   * @param texts 임베딩할 텍스트 배열
   * @returns 임베딩 벡터 배열
   */
  async createBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      this.logger.error(`배치 임베딩 생성 중 오류 발생: ${error.message}`, error.stack);
      throw new Error(`배치 임베딩을 생성할 수 없습니다: ${error.message}`);
    }
  }

  /**
   * 두 임베딩 벡터 간의 코사인 유사도를 계산합니다.
   * @param embedding1 첫 번째 임베딩 벡터
   * @param embedding2 두 번째 임베딩 벡터
   * @returns 코사인 유사도 (1에 가까울수록 유사함)
   */
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('임베딩 벡터의 차원이 일치하지 않습니다.');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    // 0으로 나누기 방지
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}
