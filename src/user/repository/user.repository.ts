import { InjectDrizzle } from "@/common";
import { Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { eq, isNull, and } from "drizzle-orm";

@Injectable()
export default class UserRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async getUser(userId: string) {
    const results = await this.db.select()
      .from(schema.users)
      .where(and(
        eq(schema.users.id, userId),
        isNull(schema.users.deletedAt),
      ));

    return results[0];
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.db.update(schema.users).set({
      password: newPassword,
    }).where(eq(schema.users.id, userId));
  }

  async getMyDetails(userId: string) {
    return await this.db.query.users.findFirst({
      with: {
        profile: {
          with: {
            universityDetail: true,
            profileImages: {
              with: { image: true },
            },
          },
        },
      },
      where: eq(schema.users.id, userId),
    });
  }

}