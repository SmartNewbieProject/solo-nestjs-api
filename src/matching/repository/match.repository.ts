import { Injectable, Logger } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { generateUuidV7 } from "@database/schema/helper";
import { MatchType } from "@database/schema/matches";
import { eq, isNull, isNotNull, and, sql, count, ne } from "drizzle-orm";
import { Gender } from "@/types/enum";
import { PreferenceTypeGroup } from "@/types/user";
import { RawMatch } from "@/types/match";
import weekDateService from "../domain/date";

const formatDate = (date: Date) => {
  return weekDateService.createDayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS');
}



@Injectable()
export default class MatchRepository {
  private readonly logger = new Logger(MatchRepository.name);

  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async createMatch(myId: string, matcherId: string, score: number, publishedAt: Date, type: MatchType) {
    this.logger.debug({
      rawDate: publishedAt,
      formattedDate: formatDate(publishedAt),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return await this.db.insert(schema.matches).values({
      id: generateUuidV7(),
      myId,
      matcherId,
      score: score.toString(),
      publishedAt,
      expiredAt: new Date(publishedAt.getTime() + 48 * 60 * 60 * 1000),
      type,
    }).execute();
  }

  async findScheduledFemaleCandidates() {
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
          eq(schema.profiles.gender, Gender.FEMALE),
        )
      )
      .groupBy(schema.users.id, schema.profiles.id)
      .having(sql`count(distinct ${schema.userPreferenceOptions.id}) >= 5`);

    return results.map((result) => result.id);
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
          eq(schema.profiles.gender, Gender.FEMALE),
        )
      )
      .groupBy(schema.users.id, schema.profiles.id)
      .having(sql`count(distinct ${schema.userPreferenceOptions.id}) >= 4`);

    return results.map((result) => result.id);
  }

  async findLatestPartner(userId: string) {
    const results = await this.db.select()
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
      const results = [] as PreferenceTypeGroup[];
      for (const [key, value] of preferenceMap.entries()) {
        results.push({
          typeName: key,
          selectedOptions: value.map(v => ({
            id: v.id,
            displayName: v.name,
          })),
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

  async findLatestMatch(userId: string): Promise<RawMatch | null> {
    const now = weekDateService.createDayjs()
      .subtract(48, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const results = await this.db.select()
      .from(schema.matches)
      .where(
        and(
          eq(schema.matches.myId, userId),
          sql`${schema.matches.createdAt} >= ${now}`
        )
      )
      .orderBy(sql`${schema.matches.createdAt} DESC`)
      .execute();

    return results[0] || null;
  }

  async getTotalMatchingCount() {
    const results = await this.db.select({
      count: count()
    }).from(schema.matches);
    return Number(results[0].count);
  }

  async findRestMembers() {
    const date = weekDateService.createDayjs()
      .subtract(9, 'hours')
      .format('YYYY-MM-DD');
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    const results = await this.db.select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
    })
      .from(schema.users)
      .leftJoin(
        schema.profiles,
        eq(schema.users.id, schema.profiles.userId)
      )
      .leftJoin(
        schema.userPreferences,
        eq(schema.users.id, schema.userPreferences.userId)
      )
      .leftJoin(
        schema.userPreferenceOptions,
        eq(schema.userPreferences.id, schema.userPreferenceOptions.userPreferenceId)
      )
      .leftJoin(
        schema.matches,
        and(
          eq(schema.users.id, schema.matches.myId),
          eq(schema.matches.type, 'scheduled'),
          sql`${schema.matches.createdAt} >= ${startOfDay} AND ${schema.matches.createdAt} <= ${endOfDay}`
        )
      )
      .where(
        and(
          isNull(schema.users.deletedAt),
          isNull(schema.matches.id),
          eq(schema.matches.type, 'scheduled'),
          eq(schema.profiles.gender, Gender.FEMALE),
          ne(schema.profiles.rank, 'UNKNOWN')
        )
      )
      .groupBy(schema.users.id, schema.users.email, schema.users.name)
      .having(sql`count(distinct ${schema.userPreferenceOptions.id}) > 5`)
      .execute();

    return results;
  }

}
