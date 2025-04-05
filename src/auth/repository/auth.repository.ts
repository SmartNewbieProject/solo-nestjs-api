import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { eq, and, isNull } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findUserByEmail(email: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  async findUserById(id: string) {
    const result = await this.db.select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, userId));
  }

  async findRefreshToken(userId: string, refreshToken: string) {
    const result = await this.db.select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken)
        )
      )
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
  async updateRefreshToken(userId: string, oldToken: string, newToken: string) {
    await this.db.update(users)
      .set({ refreshToken: newToken })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, oldToken)
        )
      );
  }

  async removeRefreshToken(userId: string, refreshToken: string) {
    await this.db.update(users)
      .set({ refreshToken: null })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken)
        )
      );
  }

  async deleteUser(userId: string) {
    await this.db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
