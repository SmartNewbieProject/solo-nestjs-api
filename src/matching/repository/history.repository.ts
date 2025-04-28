import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class MatchHistoryRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  getMatch(matchId) {
    return this.db.query.matches.findFirst({
      where: eq(schema.matches.id, matchId),
      with: {
        matcher: true,
      },
    });
  }

}
