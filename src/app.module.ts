import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import GlobalSecurityModule from './config/security.module';
import { UserModule } from './user/user.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MatchingModule } from './matching/matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    GlobalSecurityModule,
    QdrantModule,
    EmbeddingModule,
    AuthModule,
    UserModule,
    MatchingModule,
    AdminModule,
  ],
})
export class AppModule {}
