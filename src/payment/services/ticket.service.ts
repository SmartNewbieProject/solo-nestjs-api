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
}
