import { InjectDrizzle } from "@/common";
import { Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from '@database/schema';
import { count } from "drizzle-orm/sql";

@Injectable()
export class StatsRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>
  ) { }

  async getTotalUserCount(): Promise<number> {
    const result = await this.db.select({
      count: count(schema.users.id)
    }).from(schema.users);
    return result[0].count;
  }

}
