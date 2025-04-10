import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WebClient } from '@slack/web-api';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomCacheInterceptor } from './interceptors/app-cache.interceptors';

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
  ],
  controllers: [],
  providers: [
    S3Service,
    {
      provide: 'SLACK',
      useFactory: (configService: ConfigService) => {
        return new WebClient(configService.get('SLACK_TOKEN'));
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [S3Service],
})
export class CommonModule {}
