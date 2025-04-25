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
import { AdminWithdrawalStatsController } from './controllers/admin-withdrawal-stats.controller';
import { AdminWithdrawalStatsService } from './services/admin-withdrawal-stats.service';
import { AdminWithdrawalStatsRepository } from './repositories/admin-withdrawal-stats.repository';
import { AdminSalesStatsController } from './controllers/admin-sales-stats.controller';
import { AdminSalesStatsService } from './services/admin-sales-stats.service';
import { AdminSalesStatsRepository } from './repositories/admin-sales-stats.repository';
import { AdminUserAppearanceController } from './controllers/admin-user-appearance.controller';
import { AdminUserAppearanceService } from './services/admin-user-appearance.service';
import { AdminUserAppearanceRepository } from './repositories/admin-user-appearance.repository';
import { AdminUserDetailController } from './controllers/admin-user-detail.controller';
import { AdminUserDetailService } from './services/admin-user-detail.service';
import { AdminUserDetailRepository } from './repositories/admin-user-detail.repository';

import { UserActivityInterceptor } from './interceptors/user-activity.interceptor';
import { UserActivityListener } from './listeners/user-activity.listener';
import { ActivityAggregatorService } from './services/activity-aggregator.service';
import { RedisModule } from '@/config/redis/redis.module';
import { AdminMailController } from './controllers/admin-mail.controller';
import { SignupService } from '@/auth/services/signup.service';
import { SignupRepository } from '@/auth/repository/signup.repository';
import UniversityRepository from '@/auth/repository/university.repository';
import { ImageService } from '@/user/services/image.service';
import SmsService from '@/sms/services/sms.service';

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
  controllers: [
    AdminUserController,
    AdminMatchingController,
    AdminStatsController,
    AdminActivityController,
    AdminWithdrawalStatsController,
    AdminSalesStatsController,
    AdminMailController,
    AdminUserAppearanceController,
    AdminUserDetailController,
  ],
  providers: [
    SignupService,
    SignupRepository,
    UniversityRepository,
    ImageService,
    SmsService,
    AdminUserService,
    AdminRepository,
    ProfileService,
    ProfileRepository,
    AdminMatchService,
    AdminMatchRepository,
    AdminStatsService,
    AdminStatsRepository,
    AdminActivityService,
    AdminWithdrawalStatsService,
    AdminWithdrawalStatsRepository,
    AdminSalesStatsService,
    AdminSalesStatsRepository,
    AdminUserAppearanceService,
    AdminUserAppearanceRepository,
    AdminUserDetailService,
    AdminUserDetailRepository,
    UserActivityListener,
    ActivityAggregatorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserActivityInterceptor,
    }
  ],
  exports: [AdminUserService, AdminMatchService, AdminStatsService, AdminActivityService, AdminWithdrawalStatsService, AdminSalesStatsService, AdminUserAppearanceService, AdminUserDetailService]
})
export class AdminModule {}
