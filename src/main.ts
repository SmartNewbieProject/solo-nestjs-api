import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('SOLO API')
    .setDescription('SOLO API documentation')
    .setVersion('1.0')
    .addTag('SOLO')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    url: '/docs',
    swaggerOptions: {
      docExpansion: 'list',
    },
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 8044);
}

bootstrap();
