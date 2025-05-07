process.env.TZ = 'Asia/Seoul';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { TransformInterceptor, LoggerMiddleware } from '@common/index';
import { Request, Response, NextFunction } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logLevels: LogLevel[] = process.env.NODE_ENV === 'development'
    ? ['error', 'warn', 'log', 'debug', 'verbose']
    : ['error', 'warn', 'log'];

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logLevels,
    bufferLogs: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  const apiPrefix = process.env.NODE_ENV === 'development' ? 'api' : 'app/api';
  const excludePaths = process.env.NODE_ENV === 'development'
    ? ['docs', 'docs-json', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css']
    : ['app/docs', 'app/docs-json', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css'];

  app.setGlobalPrefix(apiPrefix, {
    exclude: excludePaths
  });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://project-solo-azure.vercel.app', 'some-in-univ.com', 'https://some-in-univ.com'],
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
    .setBasePath(apiPrefix)
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

  const docsPath = process.env.NODE_ENV === 'development' ? 'docs' : 'app/docs';
  const jsonDocumentUrl = process.env.NODE_ENV === 'development' ? '/docs-json' : '/app/docs-json';

  SwaggerModule.setup(docsPath, app, document, {
    jsonDocumentUrl: jsonDocumentUrl,
    swaggerOptions: {
      docExpansion: 'list',
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 8044, '0.0.0.0');
}

bootstrap();
