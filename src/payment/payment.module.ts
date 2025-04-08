import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './controller/index.controller';
import PayService from './services/pay.service';
import PayRepository from './repository/pay.repository';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PayService, PayRepository],
  exports: [PayService]
})
export class PaymentModule {}
