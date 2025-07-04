import { Injectable } from '@nestjs/common';
import * as schema from '@/database/schema';
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, count } from 'drizzle-orm';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  getPreferencesByName(typeName: string) {
    return this.db
      .select()
      .from(schema.preferenceTypes)
      .leftJoin(
        schema.preferenceOptions,
        eq(
          schema.preferenceTypes.id,
          schema.preferenceOptions.preferenceTypeId,
        ),
      )
      .where(eq(schema.preferenceTypes.name, typeName));
  }

  async getUserPreferenceCount(userId: string) {
    const results = await this.db
      .select({
        count: count(),
      })
      .from(schema.userPreferenceOptions)
      .leftJoin(
        schema.userPreferences,
        eq(
          schema.userPreferenceOptions.userPreferenceId,
          schema.userPreferences.id,
        ),
      )
      .where(eq(schema.userPreferences.userId, userId))
      .execute();

    if (results.length === 0) {
      return 0;
    }

    return Number(results[0].count);
  }
}
