import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { generateUuidV7 } from "@database/schema/helper";

@Injectable()
export default class MatchRepository {
    constructor(
      @InjectDrizzle()
      private readonly db: NodePgDatabase<typeof schema>,
    ) {}

    async createMatch(myId: string, matcherId: string, score: string, scheduledAt: Date) {
      return await this.db.insert(schema.matches).values({
        id: generateUuidV7(),
        myId,
        matcherId,
        score,
        publishedAt: null,
        scheduledAt,
      }).execute();
    }
}
