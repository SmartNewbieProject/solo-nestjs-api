import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformInterceptor, LoggerMiddleware } from '@common/index';
import { Request, Response, NextFunction } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setGlobalPrefix('api', { exclude: ['docs', 'docs-json', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css'] });
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://project-solo-azure.vercel.app', 'some-in-univ.com', 'https://some-in-univ.com', 'https://sometimes-eosin.vercel.app', '/sometimes-eosin.vercel.app'],
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
    .setBasePath('docs')
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
  
  await app.listen(process.env.PORT ?? 8044, '0.0.0.0');
}

bootstrap();
