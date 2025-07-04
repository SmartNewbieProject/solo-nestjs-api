import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { ArticleSeeder } from '@/database/seeds/article.seed';

interface SeedArticlesCommandOptions {
  count?: string;
  commentCount?: string;
  likeCount?: string;
  batchSize?: string;
  clear?: boolean;
}

@Injectable()
@Command({
  name: 'seed:articles',
  description: '게시글, 댓글, 좋아요 데이터 시드 생성',
})
export class SeedArticlesCommand extends CommandRunner {
  constructor(private readonly articleSeeder: ArticleSeeder) {
    super();
  }

  async run(
    passedParams: string[],
    options?: SeedArticlesCommandOptions,
  ): Promise<void> {
    // nest-commander의 옵션 파싱 결과 사용
    const count = options?.count ? parseInt(options.count) : 100;
    const commentCount = options?.commentCount
      ? parseInt(options.commentCount)
      : 5;
    const likeCount = options?.likeCount ? parseInt(options.likeCount) : 10;
    const batchSize = options?.batchSize ? parseInt(options.batchSize) : 20;
    const clear = options?.clear || false;

    console.log(
      `사용되는 값 - count: ${count}, commentCount: ${commentCount}, likeCount: ${likeCount}, batchSize: ${batchSize}, clear: ${clear}`,
    );

    if (clear) {
      await this.articleSeeder.clear();
    }

    console.log(
      `${count}개의 게시글 데이터 시드를 생성합니다... (배치 크기: ${batchSize})`,
    );
    await this.articleSeeder.seed(count, commentCount, likeCount, batchSize);
  }

  @Option({
    flags: '-c, --count [count]',
    description: '생성할 게시글 수 (기본값: 100)',
  })
  parseCount(val: string): string {
    return val;
  }

  @Option({
    flags: '--comment-count [commentCount]',
    description: '게시글당 생성할 최대 댓글 수 (기본값: 5)',
  })
  parseCommentCount(val: string): string {
    return val;
  }

  @Option({
    flags: '--like-count [likeCount]',
    description: '게시글당 생성할 최대 좋아요 수 (기본값: 10)',
  })
  parseLikeCount(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --batch-size [batchSize]',
    description: '배치 처리 크기 (기본값: 20)',
  })
  parseBatchSize(val: string): string {
    return val;
  }

  @Option({
    flags: '--clear',
    description: '기존 게시글 데이터 삭제 후 생성',
  })
  parseClear(): boolean {
    return true;
  }
}
