import { Injectable, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(CustomCacheInterceptor.name);

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // GET 요청이 아닌 경우 캐시하지 않음
    if (httpAdapter.getRequestMethod(request) !== 'GET') {
      return undefined;
    }

    // 캐시 키 생성 (URL + 사용자 ID)
    const userId = request.user?.id;
    const baseKey = httpAdapter.getRequestUrl(request);
    const cacheKey = userId ? `${baseKey}-${userId}` : baseKey;
    
    this.logger.debug(`Cache key generated: ${cacheKey}`);
    return cacheKey;
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
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
      return next.handle().pipe(
        tap(response => {
          this.logger.debug(`Caching response for key: ${key}`);
          this.cacheManager.set(key, response);
        })
      );
    } catch (error) {
      this.logger.error(`Cache error for key ${key}:`, error);
      return next.handle();
    }
  }
}