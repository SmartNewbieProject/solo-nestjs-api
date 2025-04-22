import { Module, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { MailService } from './services/mail.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WebClient } from '@slack/web-api';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { CustomCacheInterceptor } from './interceptors/app-cache.interceptors';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (req.url.includes('/docs') || req.url.includes('/docs-json')) {
          return callback(null, true);
        }

        if (!file.mimetype.includes('image')) {
          return callback(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
        callback(null, true);
      },
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: [
          new Keyv({
            store: new CacheableMemory({ ttl: 60000 }),
          }),
          createKeyv({
            url: configService.get('REDIS_URL'),
            password: configService.get('REDIS_PASSWORD'),
          }),
        ],
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT', 465),
          secure: configService.get('SMTP_SECURE', true),
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
          tls: {
            // SSL 인증서 검증 비활성화 (개발 환경에서만 사용)
            rejectUnauthorized: configService.get('NODE_ENV') === 'development',
          },
          debug: configService.get('NODE_ENV') === 'development',
        },
        defaults: {
          from: `"썸타임" <${configService.get('SMTP_FROM', 'smartnewb2@gmail.com')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        }
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    S3Service,
    MailService,
    {
      provide: 'SLACK',
      useFactory: (configService: ConfigService) => {
        return new WebClient(configService.get('SLACK_TOKEN'));
      },
      inject: [ConfigService],
    },
    {
      provide: CustomCacheInterceptor,
      useFactory: (reflector: Reflector, cacheManager: any) => {
        return new CustomCacheInterceptor(reflector, cacheManager);
      },
      inject: [Reflector, 'CACHE_MANAGER'],
    },
  ],
  exports: [S3Service, MailService, CustomCacheInterceptor, 'SLACK'],
})
export class CommonModule { }
