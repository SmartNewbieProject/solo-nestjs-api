import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import * as cookieParser from 'cookie-parser';
import { TestDatabase } from './test-database';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformInterceptor, LoggerMiddleware } from '@common/index';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

export class TestApp {
  private app: NestExpressApplication | null = null;
  private testDb: TestDatabase;

  constructor() {
    this.testDb = new TestDatabase();
  }

  async init(): Promise<NestExpressApplication> {
    // 테스트 데이터베이스 연결
    await this.testDb.connect();

    // NestJS 애플리케이션 생성
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication<NestExpressApplication>();

    // 실제 애플리케이션과 동일한 설정 적용
    this.app.useStaticAssets(join(__dirname, '../../', 'public'));
    this.app.setGlobalPrefix('api', {
      exclude: [
        'docs',
        'docs-json',
        'swagger-ui-bundle.js',
        'swagger-ui-standalone-preset.js',
        'swagger-ui.css',
      ],
    });
    this.app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    this.app.use(cookieParser());
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    this.app.useGlobalInterceptors(new TransformInterceptor());

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      new LoggerMiddleware().use(req, res, next);
    });

    await this.app.init();
    return this.app;
  }

  async close(): Promise<void> {
    // 테스트 데이터 정리
    await this.testDb.cleanupTestData();

    // 데이터베이스 연결 종료
    await this.testDb.disconnect();

    // NestJS 애플리케이션 종료
    if (this.app) {
      await this.app.close();
      this.app = null;
    }
  }

  getApp(): INestApplication {
    if (!this.app) {
      throw new Error(
        '애플리케이션이 초기화되지 않았습니다. init() 메서드를 먼저 호출하세요.',
      );
    }
    return this.app;
  }

  getTestDb(): TestDatabase {
    return this.testDb;
  }
}
