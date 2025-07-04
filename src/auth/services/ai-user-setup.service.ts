import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle } from '@/common/decorators/inject-drizzle.decorator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { users, profiles } from '@/database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { Role } from '../domain/user-role.enum';
import { Gender } from '@/types/enum';
import { generateUuidV7 } from '@/database/schema/helper';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AiUserSetupService {
  private readonly logger = new Logger(AiUserSetupService.name);
  private readonly AI_USER_ID = 'ai-bot-user-id-permanent';
  private readonly AI_USER_EMAIL = 'ai-bot@sometimes.com';
  private readonly AI_USER_NAME = 'AI Bot';
  private readonly AI_USER_PHONE = '010-0000-0000';

  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * AI 사용자 계정이 존재하는지 확인
   */
  async checkAiUserExists(): Promise<boolean> {
    const user = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, this.AI_USER_ID), isNull(users.deletedAt)))
      .limit(1);

    return user.length > 0;
  }

  /**
   * AI 사용자 계정 생성
   */
  async createAiUser(): Promise<void> {
    const exists = await this.checkAiUserExists();
    if (exists) {
      this.logger.log('AI 사용자 계정이 이미 존재합니다.');
      return;
    }

    await this.db.transaction(async (tx) => {
      const profileId = generateUuidV7();
      const hashedPassword = await bcrypt.hash(
        'ai-bot-secure-password-2024',
        10,
      );

      // AI 사용자 생성
      await tx.insert(users).values({
        id: this.AI_USER_ID,
        email: this.AI_USER_EMAIL,
        name: this.AI_USER_NAME,
        password: hashedPassword,
        phoneNumber: this.AI_USER_PHONE,
        profileId,
        role: Role.USER,
        refreshToken: null,
        suspendedAt: null,
      });

      // AI 사용자 프로필 생성
      await tx.insert(profiles).values({
        id: profileId,
        userId: this.AI_USER_ID,
        name: this.AI_USER_NAME,
        age: 22,
        gender: Gender.MALE,
        title: 'AI 봇',
        instagramId: null,
        mbti: null,
        rank: 'UNKNOWN',
        is_matching_enable: false, // AI는 매칭 비활성화
        introduction: 'AI가 생성한 컨텐츠를 작성하는 봇입니다.',
      });

      this.logger.log('AI 사용자 계정이 성공적으로 생성되었습니다.');
    });
  }

  /**
   * AI 사용자 정보 조회
   */
  async getAiUser() {
    const user = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, this.AI_USER_ID), isNull(users.deletedAt)))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  }

  /**
   * 애플리케이션 시작 시 AI 사용자 자동 생성
   */
  async ensureAiUserExists(): Promise<void> {
    try {
      await this.createAiUser();
    } catch (error) {
      this.logger.error('AI 사용자 생성 중 오류 발생:', error);
    }
  }
}
