import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import { DrizzleService } from '@/database/drizzle.service';
import { users, profiles } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { UserProfile } from '@/types/user';
import { ProfileService } from '@/user/services/profile.service';

interface GenerateProfileEmbeddingsCommandOptions {
  userId?: string;
  limit?: string;
}

@Injectable()
@Command({
  name: 'generate:profile-embeddings',
  description: '사용자 프로필 임베딩을 생성합니다',
})
export class GenerateProfileEmbeddingsCommand extends CommandRunner {
  constructor(
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly drizzleService: DrizzleService,
    private readonly profileService: ProfileService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: GenerateProfileEmbeddingsCommandOptions,
  ): Promise<void> {
    console.log('전달받은 인수:', passedParams);

    try {
      // 컬렉션 초기화
      await this.profileEmbeddingService.initializeCollection();

      if (options?.userId) {
        // 특정 사용자의 프로필 임베딩 생성
        console.log(
          `사용자 ID ${options.userId}의 프로필 임베딩을 생성합니다.`,
        );
        await this.generateProfileEmbeddingForUser(options.userId);
        console.log('프로필 임베딩 생성이 완료되었습니다.');
      } else {
        // 모든 사용자의 프로필 임베딩 생성
        console.log('모든 사용자의 프로필 임베딩을 생성합니다.');
        const limit = options?.limit ? parseInt(options.limit) : undefined;
        await this.generateAllProfileEmbeddings(limit);
        console.log('모든 프로필 임베딩 생성이 완료되었습니다.');
      }
    } catch (error) {
      console.error(
        '프로필 임베딩 생성 중 오류가 발생했습니다:',
        error.message,
      );
      process.exit(1);
    }
  }

  /**
   * ProfileService를 사용하여 사용자 프로필 정보를 가져옵니다.
   * @param userId 사용자 ID
   * @returns UserProfile 타입의 프로필 정보
   */
  private async buildUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // ProfileService의 getUserProfiles 메서드를 사용하여 프로필 정보 가져오기
      const userProfile = await this.profileService.getUserProfiles(userId);
      return userProfile;
    } catch (error) {
      console.warn(
        `사용자 ${userId}의 프로필 정보를 가져오는 중 오류 발생:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * 특정 사용자의 프로필 임베딩을 생성합니다.
   * @param userId 사용자 ID
   */
  private async generateProfileEmbeddingForUser(userId: string): Promise<void> {
    console.log(`사용자 ${userId}의 프로필 임베딩을 생성합니다...`);

    // 프로필 정보 가져오기
    const userProfile = await this.buildUserProfile(userId);

    if (!userProfile) {
      console.warn(`사용자 ${userId}의 프로필 정보가 없습니다.`);
      return;
    }

    // 프로필 임베딩 생성
    await this.profileEmbeddingService.generateProfileEmbedding(
      userId,
      userProfile,
    );

    console.log(`사용자 ${userId}의 프로필 임베딩이 생성되었습니다.`);
  }

  /**
   * 모든 사용자의 프로필 임베딩을 생성합니다.
   * @param limit 처리할 사용자 수 제한 (선택적)
   */
  private async generateAllProfileEmbeddings(limit?: number): Promise<void> {
    const db = this.drizzleService.db;

    // 프로필이 있는 모든 사용자 가져오기
    const query = db
      .select({
        userId: profiles.userId,
      })
      .from(profiles);

    const userProfiles = limit ? await query.limit(limit) : await query;

    console.log(`총 ${userProfiles.length}명의 사용자 프로필을 처리합니다.`);

    // 각 사용자의 프로필 임베딩 생성
    let processed = 0;
    for (const { userId } of userProfiles) {
      try {
        await this.generateProfileEmbeddingForUser(userId);
        processed++;

        // 진행 상황 로깅
        if (processed % 10 === 0 || processed === userProfiles.length) {
          console.log(
            `${processed}/${userProfiles.length} 처리 완료 (${Math.round((processed / userProfiles.length) * 100)}%)`,
          );
        }
      } catch (error) {
        console.error(
          `사용자 ${userId}의 프로필 임베딩 생성 중 오류 발생:`,
          error.message,
        );
      }
    }
  }

  @Option({
    flags: '-u, --user-id [userId]',
    description: '특정 사용자의 프로필 임베딩을 생성합니다',
  })
  parseUserId(val: string): string {
    return val;
  }

  @Option({
    flags: '-l, --limit [limit]',
    description: '처리할 사용자 수를 제한합니다',
  })
  parseLimit(val: string): string {
    return val;
  }
}
