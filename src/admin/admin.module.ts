import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/database/drizzle.module';
import { UserModule } from '@/user/user.module';
import { AdminRepository } from './repositories/admin.repository';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUserService } from './services/admin-user.service';

@Module({
  imports: [
    DrizzleModule,
    UserModule
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService, AdminRepository, ProfileService, ProfileRepository],
  exports: [AdminUserService]
})
export class AdminModule {}
