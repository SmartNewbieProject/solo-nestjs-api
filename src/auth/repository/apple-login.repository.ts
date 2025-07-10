import { Injectable } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { InjectDrizzle } from '@/common';
import * as schema from '@database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AppleLoginRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findUnsuspendedUserByEmail(phoneNumber: string) {
    return this.db.query.users.findFirst({
      where: and(
        eq(schema.users.phoneNumber, phoneNumber),
        isNull(schema.users.deletedAt),
      ),
    });
  }
}
