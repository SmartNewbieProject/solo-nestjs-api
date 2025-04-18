import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { eq, and, isNull } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';
import { profiles } from '@database/schema';

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

  async findGenderByUserId(userId: string) {
    const result = await this.db.select({
      gender: profiles.gender
    })
      .from(schema.profiles)
      .where(and(eq(profiles.userId, userId), isNull(profiles.deletedAt)))
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
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));
  }

  async findRefreshToken(userId: string, refreshToken: string) {
    const result = await this.db.select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken),
          isNull(users.deletedAt)
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
          eq(users.refreshToken, oldToken),
          isNull(users.deletedAt)
        )
      );
  }

  async removeRefreshToken(userId: string, refreshToken: string) {
    await this.db.update(users)
      .set({ refreshToken: null })
      .where(
        and(
          eq(users.id, userId),
          eq(users.refreshToken, refreshToken),
          isNull(users.deletedAt)
        )
      );
  }

  async deleteUser(userId: string) {
    await this.db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
