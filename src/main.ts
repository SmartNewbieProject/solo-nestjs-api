import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter, TransformInterceptor, LoggerMiddleware } from '@common/index';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // 정적 파일 제공 설정
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // API 접두사 설정 - 스웨거 문서 경로는 제외
  app.setGlobalPrefix('api', { exclude: ['docs', 'docs-json', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css'] });
  app.enableCors({
    origin: ['http://localhost:3000', 'https://project-solo-azure.vercel.app'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.use((req: Request, res: Response, next: NextFunction) => {
    new LoggerMiddleware().use(req, res, next);
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('썸타임 API')
    .setDescription('썸타임 REST API 문서')
    .setVersion('1.0')
    .addTag('썸타임')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs-json',
    swaggerOptions: {
      docExpansion: 'list',
      persistAuthorization: true,
    },
  });
  
  // 스웨거 JSON 문서 제공
  app.use('/docs-json', (req, res) => {
    res.json(document);
  });
  
  // 스웨거 문서 접근 시 CORS 헤더 추가
  app.use('/docs', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });


  await app.listen(process.env.PORT ?? 8045, '0.0.0.0');
}

bootstrap();
