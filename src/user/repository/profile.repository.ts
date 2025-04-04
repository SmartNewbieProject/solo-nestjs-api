import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export default class ProfileRepository {
    constructor(
      @InjectDrizzle()
      private readonly db: NodePgDatabase<typeof schema>,
    ) {}
  
  async getAllPreferences() {
    return await this.db.select({
      typeName: schema.preferenceTypes.name,
      optionId: schema.preferenceOptions.id,
      optionDisplayName: schema.preferenceOptions.displayName,
    })
      .from(schema.preferenceOptions)
      .innerJoin(
        schema.preferenceTypes,
        eq(schema.preferenceOptions.preferenceTypeId, schema.preferenceTypes.id)
      )
      .orderBy(schema.preferenceTypes.code);
  }

}
