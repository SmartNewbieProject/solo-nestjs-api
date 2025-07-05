import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { InterestEmbeddingService } from './interest-embedding.service';
import { ProfileEmbeddingService } from './profile-embedding.service';
import { DrizzleModule } from '@/database/drizzle.module';
import { QdrantModule } from '@/config/qdrant/qdrant.module';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { ProfileSimilarFinderService } from './services/profile-similar-finder.service';
@Module({
  imports: [ConfigModule, DrizzleModule, QdrantModule],
  providers: [
    EmbeddingService,
    InterestEmbeddingService,
    ProfileEmbeddingService,
    ProfileService,
    ProfileRepository,
    ProfileSimilarFinderService,
  ],
  exports: [
    EmbeddingService,
    InterestEmbeddingService,
    ProfileEmbeddingService,
    ProfileSimilarFinderService,
  ],
})
export class EmbeddingModule {}
