import { Similarity, WeightedPartner } from '@/types/match';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MatchingStatsService {
  private readonly MATCH_COUNT_PREFIX = 'user';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async incrementMatchCount(userId: string): Promise<void> {
    const key = `${this.MATCH_COUNT_PREFIX}:${userId}:match_count`;
    const count = Number(await this.cacheManager.get(key)) || 0;
    await this.cacheManager.set(key, count + 1, 30 * 24 * 60 * 60);
  }

  async getMatchCount(userId: string): Promise<number> {
    const key = `${this.MATCH_COUNT_PREFIX}:${userId}:match_count`;
    return Number(await this.cacheManager.get(key)) || 0;
  }

  async createWeightedPartners(partners: Similarity[]): Promise<WeightedPartner[]> {
    return Promise.all(partners.map(async (partner) => {
      const matchCount = Number(await this.cacheManager.get(`user:${partner.userId}:match_count`)) || 0;
      const diversityScore = Math.pow(0.8, matchCount);
      const finalWeight = partner.similarity * 0.5 + diversityScore * 0.5;
      return { ...partner, matchCount, diversityScore, finalWeight };
    }));
  }

}
