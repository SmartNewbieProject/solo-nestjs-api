import { DrizzleService } from '@/database/drizzle.service';
import { tickets } from '@/database/schema/index';
import { TicketStatus, TicketType } from '@/types/match';
import { Injectable } from '@nestjs/common';
import { eq, and, isNull, ne } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InjectDrizzle } from '@/common/decorators';
import * as schema from '@/database/schema';
import { generateUuidV7 } from '@/database/schema/helper';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

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

  async createTickets(userId: string, count: number, type: TicketType, name: string) {
    // 배치 처리를 위한 티켓 데이터 생성
    const ticketValues = new Array(count).fill(null).map(() => ({
      id: generateUuidV7(),
      userId,
      type,
      name,
      status: TicketStatus.AVAILABLE,
    }));

    await this.db.insert(tickets).values(ticketValues);

    return {
      count,
      type,
      tickets: ticketValues,
    };
  }

}
