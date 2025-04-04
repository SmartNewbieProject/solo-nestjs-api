import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SignupController } from './controller/signup.controller';
import { SignupService } from './services/signup.service';
import { SignupRepository } from './repository/signup.repository';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repository/auth.repository';

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
  controllers: [SignupController, AuthController],
  providers: [SignupService, SignupRepository, AuthService, AuthRepository],
  exports: [SignupService, AuthService],
})
export class AuthModule {}
