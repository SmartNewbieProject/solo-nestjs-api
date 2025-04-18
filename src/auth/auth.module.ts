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

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [SignupController, AuthController, UniversityController],
  providers: [
    SignupService,
    SignupRepository,
    AuthService,
    AuthRepository,
    UniversityService,
    UniversityRepository,
    ImageService,
    S3Service,
  ],
  exports: [SignupService, AuthService, UniversityService],
})
export class AuthModule { }
