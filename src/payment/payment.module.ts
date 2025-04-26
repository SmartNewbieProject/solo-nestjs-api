import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './controller/index.controller';
import PayService from './services/pay.service';
import PayRepository from './repository/pay.repository';
import { TicketController } from './controller/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repository/ticket.repository';
import { DrizzleService } from '@/database/drizzle.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController, TicketController],
  providers: [PayService, DrizzleService, PayRepository, TicketService, TicketRepository],
  exports: [PayService, TicketService, TicketRepository],
})
export class PaymentModule { }
