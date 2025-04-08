import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { generateUuidV7 } from "@database/schema/helper";
import { MatchType } from "@database/schema/matches";
import { eq, isNull, isNotNull, and, sql } from "drizzle-orm";
import { Gender } from "@/types/enum";

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

    async findLatestPartner(userId: string) {
      const results =await this.db.select()
        .from(schema.matches)
        .where(eq(schema.matches.myId, userId))
        .leftJoin(schema.profiles, eq(schema.matches.matcherId, schema.profiles.userId))
        .leftJoin(schema.universityDetails, eq(schema.profiles.universityDetailId, schema.universityDetails.id))
        .leftJoin(schema.profileImages, eq(schema.profileImages.profileId, schema.profiles.id))
        .leftJoin(schema.userPreferences, eq(schema.userPreferences.userId, schema.matches.matcherId))
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      const target = results[0];
      const preferenceId = target.user_preferences?.id as string;

      const preferenceResults = await this.db.select()
       .from(schema.userPreferenceOptions)
       .leftJoin(schema.preferenceOptions, eq(schema.userPreferenceOptions.preferenceOptionId, schema.preferenceOptions.id))
       .leftJoin(schema.preferenceTypes, eq(schema.preferenceOptions.preferenceTypeId, schema.preferenceTypes.id))
       .where(eq(schema.userPreferenceOptions.userPreferenceId, preferenceId))
       .execute();

      const preferenceMap = new Map<string, { id: string, name: string }[]>();

      preferenceResults.map(result => {
        const typeName = result.preference_types?.name as string;
        const optionName = result.preference_options?.displayName as string;
        const optionId = result.preference_options?.id as string;

        if (!preferenceMap.has(typeName)) {
          preferenceMap.set(typeName, []);
        }
        const results = (preferenceMap.get(typeName) as { id: string, name: string }[]).concat({ id: optionId, name: optionName });
        preferenceMap.set(typeName, results);
      });

      const preferences = (() => {
        const results = [] as { type: string, options: { id: string, name: string }[] }[];
        for (const [key, value] of preferenceMap.entries()) {
          results.push({
            type: key,
            options: value,
          });
        }
        return results;
      })();

      return {
        id: target.profiles?.userId as string,
        name: target.profiles?.name as string,
        age: target.profiles?.age as number,
        gender: target.profiles?.gender as Gender,
        university: target.university_details,
        preferences,
      };
    }
}
