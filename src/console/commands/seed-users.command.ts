import { Command, CommandRunner, Option } from 'nest-commander';
import { UserSeeder } from '../../database/seeds/user.seed';
import { Injectable } from '@nestjs/common';

interface SeedUsersCommandOptions {
  count?: string;
  batchSize?: string;
  clear?: boolean;
}

@Injectable()
@Command({ name: 'seed:users', description: '사용자 데이터 시드 생성' })
export class SeedUsersCommand extends CommandRunner {
  constructor(private readonly userSeeder: UserSeeder) {
    super();
  }

  async run(
    passedParams: string[],
    options?: SeedUsersCommandOptions,
  ): Promise<void> {
    // nest-commander의 옵션 파싱 결과 사용
    const count = options?.count ? parseInt(options.count) : 100;
    const batchSize = options?.batchSize ? parseInt(options.batchSize) : 20;
    const clear = options?.clear || false;

    console.log(`사용되는 값 - count: ${count}, batchSize: ${batchSize}, clear: ${clear}`);

    if (clear) {
      await this.userSeeder.clear();
    }

    console.log(`${count}명의 사용자 데이터 시드를 생성합니다... (배치 크기: ${batchSize})`);
    await this.userSeeder.seed(count, batchSize);
  }

  @Option({
    flags: '-c, --count [count]',
    description: '생성할 사용자 수 (기본값: 100)',
  })
  parseCount(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --batch-size [batchSize]',
    description: '한 번에 생성할 사용자 수 (기본값: 20)',
  })
  parseBatchSize(val: string): string {
    return val;
  }

  @Option({
    flags: '--clear',
    description: '시드 생성 전에 기존 데이터 삭제',
  })
  parseClear(): boolean {
    return true;
  }
}
