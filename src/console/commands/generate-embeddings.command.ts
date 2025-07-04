import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InterestEmbeddingService } from '@/embedding/interest-embedding.service';

interface GenerateEmbeddingsCommandOptions {
  optionId?: string;
  userId?: string;
  interests?: string;
}

@Injectable()
@Command({
  name: 'generate:embeddings',
  description: '관심사 임베딩을 생성합니다',
})
export class GenerateEmbeddingsCommand extends CommandRunner {
  constructor(
    private readonly interestEmbeddingService: InterestEmbeddingService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: GenerateEmbeddingsCommandOptions,
  ): Promise<void> {
    console.log('전달받은 인수:', passedParams);

    try {
      if (options?.optionId) {
        console.log(`옵션 ID ${options.optionId}에 대한 임베딩을 생성합니다.`);
        await this.interestEmbeddingService.generateInterestEmbedding(
          options.optionId,
        );
        console.log('임베딩 생성이 완료되었습니다.');
      } else if (options?.userId && options?.interests) {
        const interestList = options.interests.split(',').map((i) => i.trim());
        console.log(
          `사용자 ID ${options.userId}의 관심사 임베딩을 생성합니다.`,
        );
        console.log(`관심사: ${interestList.join(', ')}`);
        await this.interestEmbeddingService.generateUserInterestEmbedding(
          options.userId,
          interestList,
        );
        console.log('사용자 관심사 임베딩 생성이 완료되었습니다.');
      } else {
        console.log('모든 관심사에 대한 임베딩을 생성합니다.');
        await this.interestEmbeddingService.generateAllInterestEmbeddings();
        console.log('모든 임베딩 생성이 완료되었습니다.');
      }
    } catch (error) {
      console.error('임베딩 생성 중 오류가 발생했습니다:', error.message);
      process.exit(1);
    }
  }

  @Option({
    flags: '-o, --option-id [optionId]',
    description: '특정 관심사 옵션 ID에 대한 임베딩만 생성합니다',
  })
  parseOptionId(val: string): string {
    return val;
  }

  @Option({
    flags: '-u, --user-id [userId]',
    description: '특정 사용자의 관심사 임베딩을 생성합니다',
  })
  parseUserId(val: string): string {
    return val;
  }

  @Option({
    flags: '-i, --interests [interests]',
    description: '사용자의 관심사 목록(쉼표로 구분)',
  })
  parseInterests(val: string): string {
    return val;
  }
}
