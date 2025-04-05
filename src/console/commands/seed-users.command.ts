import { Command, CommandRunner, Option } from 'nest-commander';
import { UserSeeder } from '../../database/seeds/user.seed';
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({ name: 'seed:users', description: '사용자 데이터 시드 생성' })
export class SeedUsersCommand extends CommandRunner {
  constructor(private readonly userSeeder: UserSeeder) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    // 명령줄 인수를 직접 처리합니다
    console.log('전달받은 인수:', process.argv);
    
    // 직접 명령줄 인수를 파싱합니다
    let count = 100;
    let batchSize = 20;
    let clear = false;
    
    // 명령줄 인수를 순회하면서 처리합니다
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === '--count' && i + 1 < process.argv.length) {
        count = parseInt(process.argv[i + 1]);
      }
      if (process.argv[i] === '--batch-size' && i + 1 < process.argv.length) {
        batchSize = parseInt(process.argv[i + 1]);
      }
      if (process.argv[i] === '--clear') {
        clear = true;
      }
    }
    
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
  parseCount(val: string): number {
    console.log(`받은 count 값: ${val}`);
    return Number(val);
  }

  @Option({
    flags: '-b, --batch-size [batchSize]',
    description: '한 번에 생성할 사용자 수 (기본값: 20)',
  })
  parseBatchSize(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '--clear',
    description: '시드 생성 전에 기존 데이터 삭제',
  })
  parseClear(): boolean {
    return true;
  }
}
