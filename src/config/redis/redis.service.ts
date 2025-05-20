import { Injectable, Inject, Logger } from '@nestjs/common';
import IORedis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redisClient: IORedis;

  constructor() {
    // Redis 클라이언트 직접 생성
    this.redisClient = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });
    this.logger.log('Redis 서비스 초기화 완료');
  }

  /**
   * HyperLogLog에 요소 추가
   * @param key Redis 키
   * @param elements 추가할 요소들
   */
  async pfadd(key: string, ...elements: string[]): Promise<number> {
    return await this.redisClient.pfadd(key, ...elements);
  }

  /**
   * HyperLogLog 카디널리티 조회
   * @param key Redis 키
   */
  async pfcount(key: string): Promise<number> {
    return await this.redisClient.pfcount(key);
  }

  /**
   * 여러 HyperLogLog 병합
   * @param destkey 대상 키
   * @param sourcekeys 소스 키들
   */
  async pfmerge(destkey: string, ...sourcekeys: string[]): Promise<string> {
    return await this.redisClient.pfmerge(destkey, ...sourcekeys);
  }

  /**
   * 키 패턴으로 검색
   * @param pattern 키 패턴
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  /**
   * 키 값 증가
   * @param key Redis 키
   */
  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  /**
   * 키 값 조회
   * @param key Redis 키
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * 키 값 설정
   * @param key Redis 키
   * @param value 값
   * @param ttl TTL (초)
   */
  async set(key: string, value: string, ttl?: number): Promise<string> {
    if (ttl) {
      return await this.redisClient.set(key, value, 'EX', ttl);
    }
    return await this.redisClient.set(key, value);
  }

  /**
   * 키 삭제
   * @param key Redis 키
   */
  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  /**
   * 정렬된 집합에 요소 추가
   * @param key Redis 키
   * @param score 점수
   * @param member 멤버
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redisClient.zadd(key, score, member);
  }

  /**
   * 정렬된 집합에서 범위로 요소 조회
   * @param key Redis 키
   * @param min 최소 점수
   * @param max 최대 점수
   */
  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    return await this.redisClient.zrangebyscore(key, min, max);
  }

  /**
   * 정렬된 집합의 카디널리티 조회
   * @param key Redis 키
   */
  async zcard(key: string): Promise<number> {
    return await this.redisClient.zcard(key);
  }

  /**
   * 파이프라인 생성
   */
  pipeline() {
    return this.redisClient.pipeline();
  }
}
