import { Injectable } from '@nestjs/common';
import { TicketRepository } from '../repository/ticket.repository';
import { TicketSummary, TicketStatus, TicketType } from '@/types/match';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async getRematchingTickets(userId: string): Promise<TicketSummary[]> {
    const tickets = await this.ticketRepository.getRematchingTickets(userId);

    return tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status as TicketStatus,
      name: ticket.name,
      type: ticket.type as TicketType,
      expiredAt: ticket.expiredAt,
      createdAt: ticket.createdAt,
    }));
  }

  createRematchingTickets(userId: string, count: number) {
    return this.ticketRepository.createTickets(
      userId,
      count,
      TicketType.REMATCHING,
      '연인 재매칭권',
    );
  }

  getAvailableTicket(userId: string, ticket: TicketType) {
    return this.ticketRepository.getAvailableTicket(userId, ticket);
  }

  useTicket(ticketId: string) {
    return this.ticketRepository.use(ticketId);
  }
}
