import { Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
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
import { AdminActivityController } from './controllers/admin-activity.controller';
import { AdminActivityService } from './services/admin-activity.service';

import { UserActivityInterceptor } from './interceptors/user-activity.interceptor';
import { UserActivityListener } from './listeners/user-activity.listener';
import { ActivityAggregatorService } from './services/activity-aggregator.service';
import { RedisModule } from '@/config/redis/redis.module';

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    MatchingModule,
    SlackNotificationModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    RedisModule,
  ],
  controllers: [AdminUserController, AdminMatchingController, AdminStatsController, AdminActivityController],
  providers: [
    AdminUserService,
    AdminRepository,
    ProfileService,
    ProfileRepository,
    AdminMatchService,
    AdminMatchRepository,
    AdminStatsService,
    AdminStatsRepository,
    AdminActivityService,
    UserActivityListener,
    ActivityAggregatorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserActivityInterceptor,
    }
  ],
  exports: [AdminUserService, AdminMatchService, AdminStatsService, AdminActivityService]
})
export class AdminModule {}
