
import { Injectable } from "@nestjs/common";
import * as schema from "@/database/schema";
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from 'drizzle-orm';

@Injectable()
export class PreferenceRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async getPreferencesByName(typeName: string) {
    return await this.db.select()
      .from(schema.preferenceTypes)
      .leftJoin(schema.preferenceOptions, eq(schema.preferenceTypes.id, schema.preferenceOptions.preferenceTypeId))
      .where(eq(schema.preferenceTypes.name, typeName));
  }
}

