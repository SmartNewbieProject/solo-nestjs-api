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

    async createMatch(maleUserId: string, femaleUserId: string, score: string) {
      return await this.db.insert(schema.matches).values({
        id: generateUuidV7(),
        maleUserId,
        femaleUserId,
        score,
        publishedAt: null,
        scheduledAt: null,
      }).execute();
    }
}
