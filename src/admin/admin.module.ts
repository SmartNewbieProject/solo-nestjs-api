import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/database/drizzle.module';
import { UserModule } from '@/user/user.module';
import { AdminRepository } from './repositories/admin.repository';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUserService } from './services/admin-user.service';
import { AdminMatchingController } from './controllers/admin-matching.controller';
import AdminMatchService from './services/match.service';
import AdminMatchRepository from './repositories/match.repository';
import { MatchingModule } from '@/matching/matching.module';
import { SlackNotificationModule } from '@/slack-notification/slack-notification.module';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminStatsRepository } from './repositories/admin-stats.repository';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    MatchingModule,
    SlackNotificationModule,
  ],
  controllers: [AdminUserController, AdminMatchingController, AdminStatsController],
  providers: [
    AdminUserService,
    AdminRepository,
    ProfileService,
    ProfileRepository,
    AdminMatchService,
    AdminMatchRepository,
    AdminStatsService,
    AdminStatsRepository
  ],
  exports: [AdminUserService, AdminMatchService, AdminStatsService]
})
export class AdminModule {}
