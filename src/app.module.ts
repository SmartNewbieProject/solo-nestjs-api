import { Module } from '@nestjs/common';
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
  ],
})
export class AppModule { }
