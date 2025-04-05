import { Module } from '@nestjs/common';
import { MatchingService } from './services/matching.service';
import { AdminMatchingController } from './controllers/admin-matching.controller';
import { DrizzleModule } from '@/database/drizzle.module';
import { EmbeddingModule } from '@/embedding/embedding.module';
import { QdrantModule } from '@/qdrant/qdrant.module';
import ProfileRepository from '@/user/repository/profile.repository';
import { ProfileService } from '@/user/services/profile.service';

@Module({
  imports: [
    DrizzleModule,
    EmbeddingModule,
    QdrantModule,
  ],
  providers: [MatchingService, ProfileRepository, ProfileService],
  controllers: [AdminMatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
