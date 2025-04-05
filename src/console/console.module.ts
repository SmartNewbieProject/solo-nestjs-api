import { Module } from '@nestjs/common';
import { SeedUsersCommand } from './commands/seed-users.command';
import { UserSeeder } from '../database/seeds/user.seed';
import { DrizzleModule } from '@/database/drizzle.module';
import { GenerateEmbeddingsCommand } from './commands/generate-embeddings.command';
import { GenerateProfileEmbeddingsCommand } from './commands/generate-profile-embeddings.command';
import { EmbeddingModule } from '@/embedding/embedding.module';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { DatabaseModule } from '@/database/database.module';

@Module(  {
  imports: [DrizzleModule, EmbeddingModule, DatabaseModule, EmbeddingModule],
  providers: [SeedUsersCommand, UserSeeder, GenerateEmbeddingsCommand, GenerateProfileEmbeddingsCommand, ProfileService, ProfileRepository],
})
export class ConsoleModule {}
