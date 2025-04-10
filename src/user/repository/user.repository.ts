import { InjectDrizzle } from "@/common";
import { Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { PasswordUpdated } from "../dto/user";
import { eq } from "drizzle-orm";

@Injectable()
export default class UserRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getUser(userId: string) {
    const results = await this.db.select().from(schema.users).where(eq(schema.users.id, userId));
    return results[0];
  }

  async updatePassword(userId: string, newPassword: string) {
    await this.db.update(schema.users).set({
      password: newPassword,
    }).where(eq(schema.users.id, userId));
  }
}