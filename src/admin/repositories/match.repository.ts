import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { eq, isNull, and, between, isNotNull, count, sql } from 'drizzle-orm';
import weekDateService from '@/matching/domain/date';
import { PaginatedResponse, Pagination } from '@/types/common';
import { Gender } from '@/types/enum';
import { UnmatchedUser } from '@/types/match';

@Injectable()
export default class AdminMatchRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getUnmatchedUsers(
    pagination: Pagination,
  ): Promise<PaginatedResponse<UnmatchedUser>> {
    const { start, end } = weekDateService.getCheckedDates();

    const results = await this.db
      .select()
      .from(schema.users)
      .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .leftJoin(schema.matches, eq(schema.matches.myId, schema.users.id))
      .where(
        and(
          isNull(schema.users.deletedAt),
          isNull(between(schema.matches.publishedAt, start, end)),
          isNotNull(schema.profiles.name),
          isNotNull(schema.profiles.age),
          isNotNull(schema.profiles.gender),
        ),
      )
      .limit(pagination.limit)
      .offset(
        (pagination.page === 1 ? 1 : pagination.page - 1) * pagination.limit,
      )
      .execute();

    const totalCountResult = await this.db
      .select({ count: count() })
      .from(schema.users)
      .leftJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .leftJoin(schema.matches, eq(schema.matches.myId, schema.users.id))
      .where(
        and(
          isNull(schema.users.deletedAt),
          isNull(between(schema.matches.publishedAt, start, end)),
          isNotNull(schema.profiles.name),
          isNotNull(schema.profiles.age),
          isNotNull(schema.profiles.gender),
        ),
      )
      .execute();

    const totalCount = totalCountResult[0].count;

    const unmatchedUsers = results.map((result) => ({
      id: result.users.id,
      name: result?.profiles?.name as string,
      age: result?.profiles?.age as number,
      gender: result?.profiles?.gender as Gender,
      joinedAt: result.users.createdAt,
    })) as UnmatchedUser[];

    return {
      items: unmatchedUsers,
      meta: {
        currentPage: pagination.page,
        itemsPerPage: pagination.limit,
        totalItems: totalCount,
        hasNextPage: pagination.page * pagination.limit < totalCount,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  private preprocess = (d: Date) =>
    d.toISOString().replace('T', ' ').replace('Z', '');

  async getTotalMatchCount(publishedAt: Date) {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.matches)
      .innerJoin(schema.users, eq(schema.matches.myId, schema.users.id))
      .innerJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .where(
        sql`${schema.matches.publishedAt} = ${this.preprocess(publishedAt)}`,
      )
      .execute();

    return Number(result[0]?.count || 0);
  }

  async getGenderMatchCount(publishedAt: Date, gender: Gender) {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.matches)
      .innerJoin(schema.users, eq(schema.matches.myId, schema.users.id))
      .innerJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .where(
        and(
          sql`${schema.matches.publishedAt} = ${this.preprocess(publishedAt)}`,
          eq(schema.profiles.gender, gender),
        ),
      )
      .execute();

    return Number(result[0]?.count || 0);
  }
}
