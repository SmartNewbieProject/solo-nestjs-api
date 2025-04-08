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

@Module({
  imports: [
    DrizzleModule,
    UserModule,
    MatchingModule
  ],
  controllers: [AdminUserController, AdminMatchingController],
  providers: [AdminUserService, AdminRepository, ProfileService, ProfileRepository, AdminMatchService, AdminMatchRepository],
  exports: [AdminUserService, AdminMatchService]
})
export class AdminModule {}
