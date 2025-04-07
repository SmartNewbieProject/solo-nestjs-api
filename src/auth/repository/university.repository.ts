import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { universityDetails } from "@database/schema/university_details";
import { UniversityRegister } from "../dto/university";
import { and, eq, isNull, sql } from "drizzle-orm";
import { generateUuidV7 } from "@/database/schema/helper";

@Injectable()
export default class UniversityRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
  ) {}

  async registerUniversity(userId: string, university: UniversityRegister) {
    const exists = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(universityDetails)
      .where(
        and(
          eq(universityDetails.userId, userId),
          isNull(universityDetails.deletedAt)
        )
      )
      .then(result => result[0].count > 0);

    if (!exists) {
      await this.db.insert(universityDetails)
      .values({ ...university, userId, id: generateUuidV7() })
      .execute();
      return;
    }

    await this.db.update(universityDetails)
      .set({ ...university, updatedAt: new Date() })
      .where(and(eq(universityDetails.userId, userId), isNull(universityDetails.deletedAt)))
      .execute();
  }

  async removeUniversity(userId: string) {
    await this.db.update(universityDetails)
      .set({ deletedAt: new Date() })
      .where(eq(universityDetails.userId, userId))
      .execute();
  }
} 
