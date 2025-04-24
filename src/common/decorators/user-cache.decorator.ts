import { SetMetadata } from '@nestjs/common';

export const USER_CACHE_KEY = 'user_cache';
export const USER_CACHE_TTL = 'user_cache_ttl';

export interface UserCacheOptions {
  ttl?: number;        // 캐시 유효 시간 (초)
  keyPrefix?: string;  // 캐시 키 접두사
}

export const UserCache = (options: UserCacheOptions = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(USER_CACHE_KEY, options.keyPrefix || propertyKey)(target, propertyKey, descriptor);
    SetMetadata(USER_CACHE_TTL, options.ttl || 300)(target, propertyKey, descriptor);
    return descriptor;
  };
};