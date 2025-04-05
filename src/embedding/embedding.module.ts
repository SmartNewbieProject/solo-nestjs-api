import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { InterestEmbeddingService } from './interest-embedding.service';
import { ProfileEmbeddingService } from './profile-embedding.service';
import { DrizzleModule } from '@/database/drizzle.module';
import { QdrantModule } from '@/qdrant/qdrant.module';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    QdrantModule,
  ],
  providers: [
    EmbeddingService,
    InterestEmbeddingService,
    ProfileEmbeddingService,
  ],
  exports: [
    EmbeddingService,
    InterestEmbeddingService,
    ProfileEmbeddingService,
  ],
})
export class EmbeddingModule {}
