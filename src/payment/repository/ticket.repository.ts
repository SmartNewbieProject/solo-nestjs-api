import { DrizzleService } from '@/database/drizzle.service';
import { tickets } from '@/database/schema/index';
import { Injectable } from '@nestjs/common';
import { eq, and, isNull, ne } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TicketRepository {
  private readonly db: NodePgDatabase<typeof import('@/database/schema/index')>;

  constructor(private readonly drizzleService: DrizzleService) {
    this.db = drizzleService.db;
  }

  getRematchingTickets(userId: string) {
    return this.db.query.tickets.findMany({
      where: and(
        eq(tickets.type, 'rematching'),
        eq(tickets.userId, userId),
        isNull(tickets.deletedAt),
        ne(tickets.status, 'available'),
      ),
    }).execute();
  }
}
