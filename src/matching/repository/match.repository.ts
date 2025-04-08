import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { generateUuidV7 } from "@database/schema/helper";
import { MatchType } from "@database/schema/matches";
import { eq, isNull, isNotNull, and, sql } from "drizzle-orm";

@Injectable()
export default class MatchRepository {
    constructor(
      @InjectDrizzle()
      private readonly db: NodePgDatabase<typeof schema>,
    ) {}

    async createMatch(myId: string, matcherId: string, score: number, publishedAt: Date, type: MatchType) {
      return await this.db.insert(schema.matches).values({
        id: generateUuidV7(),
        myId,
        matcherId,
        score: score.toString(),
        publishedAt,
        type,
      }).execute();
    }

    async findAllMatchingUsers() {
      const results = await this.db.select({
        id: schema.users.id,
      })
      .from(schema.users)
      .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .leftJoin(schema.userPreferences, eq(schema.userPreferences.userId, schema.users.id))
      .leftJoin(schema.userPreferenceOptions, eq(schema.userPreferenceOptions.userPreferenceId, schema.userPreferences.id))
      .where(
        and(
          isNull(schema.users.deletedAt),
          isNotNull(schema.profiles.age),
          isNotNull(schema.profiles.gender),
        )
      )
      .groupBy(schema.users.id, schema.profiles.id)
      .having(sql`count(distinct ${schema.userPreferenceOptions.id}) >= 4`);

      return results.map((result) => result.id);
    }
}
