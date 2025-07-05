import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import MatchRepository from '@/matching/repository/match.repository';
import { ProfileService } from '@/user/services/profile.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminBatchVectorService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly profileService: ProfileService,
  ) {}

  async batch() {
    const userIds = await this.matchRepository.findAllMatchingUsers();
    const promises = userIds.map(async (userId) => {
      const profile = await this.profileService.getUserProfiles(userId, false);
      await this.profileEmbeddingService.generateProfileEmbedding(
        userId,
        profile,
      );
    });
    const results = await Promise.allSettled(promises);
    return {
      countProcessed: userIds.length,
      countFailed: results.filter((result) => result.status === 'rejected')
        .length,
      countSuccess: results.filter((result) => result.status === 'fulfilled')
        .length,
    };
  }
}
