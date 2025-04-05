import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { universityDetails } from "@database/schema/university_details";
import { UniversityRegister } from "../dto/university";
import { generateUuidV7 } from "@/database/schema/helper";
import { eq } from "drizzle-orm";

@Injectable()
export default class UniversityRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
  ) {}

  async registerUniversity(userId: string, university: UniversityRegister) {
    await this.db.transaction(async (tx) => {
      await tx.insert(universityDetails)
        .values({
          id: generateUuidV7(),
          userId,
          universityName: university.universityName,
          department: university.department,
          authentication: false,
          grade: university.grade,
          studentNumber: university.studentNumber,
        })
        .execute();
    });
  }

  async removeUniversity(userId: string) {
    await this.db.delete(universityDetails)
      .where(eq(universityDetails.userId, userId))
      .execute();
  }

} 
