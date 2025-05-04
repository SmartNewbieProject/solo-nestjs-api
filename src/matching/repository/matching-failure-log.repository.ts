import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { generateUuidV7 } from "@database/schema/helper";

@Injectable()
export class MatchingFailureLogRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async createFailureLog(userId: string, reason: string) {
    return await this.db.insert(schema.matchingFailureLogs).values({
      id: generateUuidV7(),
      userId,
      reason,
    }).execute();
  }

  async getFailureLogs(userId?: string) {
    const query = this.db.select()
      .from(schema.matchingFailureLogs)
      .leftJoin(schema.users, schema.matchingFailureLogs.userId.eq(schema.users.id))
      .orderBy(schema.matchingFailureLogs.createdAt);

    if (userId) {
      query.where(schema.matchingFailureLogs.userId.eq(userId));
    }

    return await query.execute();
  }
}
