import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { universityDetails } from '@database/schema/university_details';
import { UniversityRegister } from '../dto/university';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';

@Injectable()
export default class UniversityRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async registerUniversity(userId: string, university: UniversityRegister) {
    const exists = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(universityDetails)
      .where(
        and(
          eq(universityDetails.userId, userId),
          isNull(universityDetails.deletedAt),
        ),
      )
      .then((result) => result[0].count > 0);

    if (!exists) {
      const [result] = await this.db
        .insert(universityDetails)
        .values({ ...university, userId, id: generateUuidV7() })
        .returning();
      return result;
    }

    const [result] = await this.db
      .update(universityDetails)
      .set({ ...university, updatedAt: new Date() })
      .where(
        and(
          eq(universityDetails.userId, userId),
          isNull(universityDetails.deletedAt),
        ),
      )
      .returning();
    return result;
  }

  async removeUniversity(userId: string) {
    await this.db
      .update(universityDetails)
      .set({ deletedAt: new Date() })
      .where(eq(universityDetails.userId, userId))
      .execute();
  }

  async getUniversities(name?: string): Promise<string[]> {
    const conditions = [eq(schema.universities.isActive, true)];

    if (name) {
      conditions.push(sql`${schema.universities.name} ILIKE ${`%${name}%`}`);
    }

    const result = await this.db
      .select({
        name: schema.universities.name,
      })
      .from(schema.universities)
      .where(and(...conditions))
      .execute();

    return result.map((row) => row.name);
  }

  async getDepartments(universityName: string): Promise<string[]> {
    const result = await this.db
      .select({
        departmentName: schema.departments.name,
      })
      .from(schema.departments)
      .innerJoin(
        schema.universities,
        eq(schema.departments.universityId, schema.universities.id),
      )
      .where(
        and(
          eq(schema.universities.name, universityName),
          eq(schema.universities.isActive, true),
          eq(schema.departments.isActive, true),
        ),
      )
      .execute();

    return result.map((row) => row.departmentName);
  }
}
