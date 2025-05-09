import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import GlobalSecurityModule from './config/security.module';
import { UserModule } from './user/user.module';
import { QdrantModule } from './config/qdrant/qdrant.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MatchingModule } from './matching/matching.module';
import { ArticleModule } from './article/article.module';
import { PaymentModule } from './payment/payment.module';
import { HealthModule } from './health/health.module';
import { SlackNotificationModule } from './slack-notification/slack-notification.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformDateMiddleware } from '@common/middleware/transform-date.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GlobalSecurityModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    QdrantModule,
    EmbeddingModule,
    EventEmitterModule.forRoot(),
    MatchingModule,
    AdminModule,
    ArticleModule,
    PaymentModule,
    HealthModule,
    SlackNotificationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TransformDateMiddleware)
      .forRoutes('*');
  }
}
