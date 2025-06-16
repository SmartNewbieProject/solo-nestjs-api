import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SignupController } from './controller/signup.controller';
import { SignupService } from './services/signup.service';
import { SignupRepository } from './repository/signup.repository';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repository/auth.repository';
import { UniversityController } from './controller/university.controller';
import { UniversityService } from './services/university.service';
import UniversityRepository from './repository/university.repository';
import { ImageService } from '@/user/services/image.service';
import { S3Service } from '@/common/services/s3.service';
import { SmsModule } from '@/sms/sms.module';
import { AiTokenController } from './controller/ai-token.controller';
import { AiTokenService } from './services/ai-token.service';
import { AiUserSetupService } from './services/ai-user-setup.service';

@Module({
  imports: [SmsModule],
  controllers: [SignupController, AuthController, UniversityController, AiTokenController],
  providers: [
    SignupService,
    SignupRepository,
    AuthService,
    AuthRepository,
    UniversityService,
    UniversityRepository,
    ImageService,
    S3Service,
    AiTokenService,
    AiUserSetupService,
  ],
  exports: [SignupService, AuthService, UniversityService, AiTokenService],
})
export class AuthModule { }
