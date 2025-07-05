import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './controller/index.controller';
import PayService from './services/pay.service';
import PayRepository from './repository/pay.repository';
import { TicketController } from './controller/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repository/ticket.repository';
import { DrizzleService } from '@/database/drizzle.service';
import UserRepository from '@/user/repository/user.repository';
import { GemController } from '@/payment/controller/v1/gem.controller';
import { GemProductViewer } from '@/payment/services/product-viewer.service';
import { GemRepository } from '@/payment/repository/gem.repository';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController, TicketController, GemController],
  providers: [
    PayService,
    DrizzleService,
    PayRepository,
    TicketService,
    TicketRepository,
    UserRepository,
    GemProductViewer,
    GemRepository,
  ],
  exports: [PayService, TicketService, TicketRepository],
})
export class PaymentModule {}
