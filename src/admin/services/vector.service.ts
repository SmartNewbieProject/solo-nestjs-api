import { ProfileEmbeddingService } from "@/embedding/profile-embedding.service";
import MatchRepository from "@/matching/repository/match.repository";
import { ProfileService } from "@/user/services/profile.service";
import { Injectable } from "@nestjs/common";
import pLimit from 'p-limit';

@Injectable()
export class AdminBatchVectorService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly profileService: ProfileService,
  ) {}

  async batch() {
    const userIds = await this.matchRepository.findAllMatchingUsers();
    const limit = pLimit(10);
    const promises = userIds.map(userId => limit(async () => {
      const profile = await this.profileService.getUserProfiles(userId, false);
      await this.profileEmbeddingService.generateProfileEmbedding(userId, profile);
    }));
    const results = await Promise.allSettled(promises);
    return {
      countProcessed: userIds.length,
      countFailed: results.filter(result => result.status === 'rejected').length,
      countSuccess: results.filter(result => result.status === 'fulfilled').length,
    }
  }

}
