import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { MatchingService } from './services/matching.service';
import { AdminMatchingController } from '../admin/controllers/admin-matching.controller';
import { DrizzleModule } from '@/database/drizzle.module';
import { EmbeddingModule } from '@/embedding/embedding.module';
import { QdrantModule } from '@/config/qdrant/qdrant.module';
import ProfileRepository from '@/user/repository/profile.repository';
import { ProfileService } from '@/user/services/profile.service';
import UserMatchingController from './controllers/matching.controller';
import MatchingCreationService from './services/creation.service';
import MatchRepository from './repository/match.repository';
import { ScheduleModule } from '@nestjs/schedule';
import AdminMatchRepository from '@/admin/repositories/match.repository';
import AdminMatchService from '@/admin/services/match.service';
import { PaymentModule } from '@/payment/payment.module';
import { MatchHistoryService } from './services/history.service';
import { MatchHistoryRepository } from './repository/history.repository';
import { HistoryController } from './controllers/history.controller';

@Module({
  imports: [
    DrizzleModule,
    EmbeddingModule,
    QdrantModule,
    ScheduleModule.forRoot(),
    CommonModule,
    PaymentModule,
  ],
  providers: [
    MatchingService,
    ProfileRepository,
    MatchHistoryService,
    MatchHistoryRepository,
    ProfileService,
    MatchingCreationService,
    MatchRepository,
    AdminMatchRepository,
    AdminMatchService,
  ],
  controllers: [
    AdminMatchingController,
    UserMatchingController,
    HistoryController
  ],
  exports: [MatchingService, MatchingCreationService],
})
export class MatchingModule { }
