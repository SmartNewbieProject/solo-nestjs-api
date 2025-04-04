import { Module } from '@nestjs/common';
import { SignupController } from './controller/signup.controller';
import { SignupService } from './services/signup.service';
import { SignupRepository } from './repository/signup.repository';

@Module({
  controllers: [SignupController],
  providers: [SignupService, SignupRepository],
  exports: [SignupService],
})
export class AuthModule {}
