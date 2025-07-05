import {
  Injectable,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CacheInterceptor,
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(CustomCacheInterceptor.name);

  constructor(
    reflector: Reflector,
    protected readonly cacheManager: any,
  ) {
    super(reflector, cacheManager);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // GET 요청이 아닌 경우 캐시하지 않음
    if (httpAdapter.getRequestMethod(request) !== 'GET') {
      return undefined;
    }

    // 데코레이터로 명시된 엔드포인트만 캐싱
    const handler = context.getHandler();
    const hasCacheKey = this.reflector.get(CACHE_KEY_METADATA, handler);

    // 캐시 키가 명시적으로 설정되지 않은 경우 캐싱하지 않음
    if (!hasCacheKey) {
      this.logger.debug('No cache key decorator found, skipping cache');
      return undefined;
    }

    // 캐시 키 생성 (URL + 사용자 ID)
    const userId = request.user?.id;
    const baseKey = httpAdapter.getRequestUrl(request);
    const cacheKey = userId ? `${baseKey}-${userId}` : baseKey;

    this.logger.debug(`Cache key generated: ${cacheKey}`);
    return cacheKey;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);

    if (!key) {
      return next.handle();
    }

    try {
      const value = await this.cacheManager.get(key);

      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
        this.logger.debug(`Cached value: ${JSON.stringify(value)}`);
        return of(value);
      }

      this.logger.debug(`Cache miss for key: ${key}`);

      // Get TTL from decorator or use default
      const handler = context.getHandler();
      const ttl = this.reflector.get(CACHE_TTL_METADATA, handler);

      return next.handle().pipe(
        tap((response) => {
          this.logger.debug(`Caching response for key: ${key}`);
          if (ttl) {
            this.cacheManager.set(key, response, ttl);
          } else {
            this.cacheManager.set(key, response);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error for key ${key}:`, error);
      return next.handle();
    }
  }
}
