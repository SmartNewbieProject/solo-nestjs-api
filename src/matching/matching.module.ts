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
import { MatchingFailureLogService } from './services/matching-failure-log.service';
import MatchingFailureLogRepository from './repository/matching-failure-log.repository';
import { MatchingAlertCronService } from './services/matching-alert-cron.service';
import { MailService } from '@/common/services/mail.service';
import UserRepository from '@/user/repository/user.repository';
import { MatchingMailTestController } from './controllers/matching-mail-test.controller';
import { MatchingEmailService } from './services/mail.service';
import { RedisService } from '@/config/redis/redis.service';
import { MatchingStatsService } from './services/stats.service';
import { MatchUserHistoryManager } from './domain/match-user-history';

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
    MailService,
    MatchingAlertCronService,
    UserRepository,
    MatchingEmailService,
    MatchingFailureLogService,
    MatchingFailureLogRepository,
    MatchingAlertCronService,
    RedisService,
    MatchUserHistoryManager,
    MatchingStatsService,
  ],
  controllers: [
    AdminMatchingController,
    UserMatchingController,
    HistoryController,
    MatchingMailTestController,
  ],
  exports: [MatchingService, MatchingCreationService],
})
export class MatchingModule {}
