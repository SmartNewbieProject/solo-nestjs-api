import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/database/drizzle.module';
import { UserModule } from '@/user/user.module';
import { AdminRepository } from './repositories/admin.repository';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    DrizzleModule,
    UserModule
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, ProfileService, ProfileRepository],
  exports: [AdminService]
})
export class AdminModule {}
