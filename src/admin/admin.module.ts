import { Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DrizzleModule } from '@/database/drizzle.module';
import { UserModule } from '@/user/user.module';
import { AdminRepository } from './repositories/admin.repository';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { AdminMatchingController } from './controllers/admin-matching.controller';
import AdminMatchService from './services/match.service';
import AdminMatchRepository from './repositories/match.repository';
import { MatchingModule } from '@/matching/matching.module';
import { SlackNotificationModule } from '@/slack-notification/slack-notification.module';

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

  ],
  controllers: [
    AdminMatchingController,
  ],
  providers: [
    SignupService,
    SignupRepository,
    UniversityRepository,
    ImageService,
    SmsService,
    AdminRepository,
    ProfileService,
    ProfileRepository,
    AdminMatchService,
    AdminMatchRepository,
  ],
  exports: [AdminMatchService]
})
export class AdminModule { }
