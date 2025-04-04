import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('썸타임 API')
    .setDescription('썸타임 REST API 문서')
    .setVersion('1.0')
    .addTag('썸타임')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
    },
  });


  await app.listen(process.env.PORT ?? 8044, '0.0.0.0');
}

bootstrap();
