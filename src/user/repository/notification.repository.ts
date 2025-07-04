import { InjectDrizzle } from '@/common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/database/schema';
import { eq, sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async isMemberHasIdealTypes(userId: string) {
    const result = await this.db
      .select({
        count: sql`count(*)`,
      })
      .from(schema.userPreferenceOptions)
      .leftJoin(
        schema.userPreferences,
        eq(
          schema.userPreferenceOptions.userPreferenceId,
          schema.userPreferences.id,
        ),
      )
      .where(eq(schema.userPreferences.userId, userId));
    return Number(result[0]?.count ?? 0) > 5;
  }
}
