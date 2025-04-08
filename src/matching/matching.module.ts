import { Module } from '@nestjs/common';
import { MatchingService } from './services/matching.service';
import { AdminMatchingController } from '../admin/controllers/admin-matching.controller';
import { DrizzleModule } from '@/database/drizzle.module';
import { EmbeddingModule } from '@/embedding/embedding.module';
import { QdrantModule } from '@/config/qdrant/qdrant.module';
import ProfileRepository from '@/user/repository/profile.repository';
import { ProfileService } from '@/user/services/profile.service';
import UserMatchingController from './controllers/matching.controller';
import MatchingCreationService from './services/creation.service';
import MatchRepository from './repository/match.repository';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    DrizzleModule,
    EmbeddingModule,
    QdrantModule,
    ScheduleModule.forRoot(),
  ],
  providers: [MatchingService, ProfileRepository, ProfileService, MatchingCreationService, MatchRepository],
  controllers: [AdminMatchingController, UserMatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
