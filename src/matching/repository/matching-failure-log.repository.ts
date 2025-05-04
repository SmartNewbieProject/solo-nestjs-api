import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@/common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { generateUuidV7 } from '@/database/schema/helper';
import { eq } from 'drizzle-orm';

@Injectable()
export default class MatchingFailureLogRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  /**
   * 매칭 실패 로그를 저장합니다.
   * @param userId 사용자 ID
   * @param reason 실패 이유
   * @returns 저장된 로그 정보
   */
  async createFailureLog(userId: string, reason: string) {
    return await this.db.insert(schema.matchingFailureLogs).values({
      id: generateUuidV7(),
      userId,
      reason,
    }).execute();
  }
}
