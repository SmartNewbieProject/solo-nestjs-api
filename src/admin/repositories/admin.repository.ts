import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { users } from '@/database/schema';
import { count, desc, sql } from 'drizzle-orm';
import { PaginationParams } from '@/types/pagination';

@Injectable()
export class AdminRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getUsersCount(): Promise<number> {
    const result = await this.drizzleService.db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);
    
    return result[0].count;
  }

  async getUsers(params: PaginationParams) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    return await this.drizzleService.db.query.users.findMany({
      where: sql`${users.deletedAt} IS NULL`,
      with: {
        profile: {
          with: {
            universityDetail: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(users.createdAt)],
    });
  }
}
