import { RedisService } from '@/config/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchUserHistoryManager {
  private readonly TTL = 3 * 24 * 60 * 60 * 1000; // 3일(ms)

  constructor(private readonly redisService: RedisService) {}

  async addMatchedUser(
    requesterId: string,
    matcherId: string,
    matcherName: string,
    ttl: number = this.TTL,
  ) {
    const key = `${requesterId}:match_users:${matcherId}`;
    await this.redisService.set(key, matcherName, ttl);
  }

  async getMatchedUserIds(requesterId: string): Promise<string[]> {
    const pattern = `${requesterId}:match_users:*`;
    const keys = await this.redisService.keys(pattern);
    return keys.map((id: string) => id.split(':')[2]);
  }

  async clearMatchedUsers(requesterId: string) {
    const pattern = `${requesterId}:match_users:*`;
    const keys = await this.redisService.keys(pattern);
    for (const key of keys) {
      await this.redisService.del(key);
    }
  }
}
