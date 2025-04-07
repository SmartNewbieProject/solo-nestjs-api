import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './controller/index.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
})
export class PaymentModule {}
