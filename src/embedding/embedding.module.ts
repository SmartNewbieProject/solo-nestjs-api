import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { InterestEmbeddingService } from './interest-embedding.service';
import { ProfileEmbeddingService } from './profile-embedding.service';
import { DrizzleModule } from '@/database/drizzle.module';
import { QdrantModule } from '@/qdrant/qdrant.module';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';

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
    ProfileService,
    ProfileRepository,
  ],
  exports: [
    EmbeddingService,
    InterestEmbeddingService,
    ProfileEmbeddingService,
  ],
})
export class EmbeddingModule {}
