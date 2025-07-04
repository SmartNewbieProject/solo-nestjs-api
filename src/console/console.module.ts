import { Module } from '@nestjs/common';
import { SeedUsersCommand } from './commands/seed-users.command';
import { SeedArticlesCommand } from './commands/seed-articles.command';
import { UserSeeder } from '../database/seeds/user.seed';
import { ArticleSeeder } from '../database/seeds/article.seed';
import { DrizzleModule } from '@/database/drizzle.module';
import { GenerateEmbeddingsCommand } from './commands/generate-embeddings.command';
import { GenerateProfileEmbeddingsCommand } from './commands/generate-profile-embeddings.command';
import { EmbeddingModule } from '@/embedding/embedding.module';
import { ProfileService } from '@/user/services/profile.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DrizzleModule, EmbeddingModule, DatabaseModule],
  providers: [
    SeedUsersCommand,
    SeedArticlesCommand,
    UserSeeder,
    ArticleSeeder,
    GenerateEmbeddingsCommand,
    GenerateProfileEmbeddingsCommand,
    ProfileService,
    ProfileRepository,
  ],
})
export class ConsoleModule {}
