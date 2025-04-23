import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserActivityEvent } from '../events/user-activity.event';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserActivityInterceptor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, path } = request;

    // 인증된 사용자만 활동 기록
    if (!user || !user.id) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        try {
          // 활동 유형 결정
          let activityType = 'api_request';

          // 경로에 따른 활동 유형 세분화
          if (path.includes('/articles') && method === 'POST') {
            activityType = 'post_article';
          } else if (path.includes('/comments') && method === 'POST') {
            activityType = 'post_comment';
          } else if (path.includes('/articles') && method === 'GET' && path.includes('/:id')) {
            activityType = 'view_article';
          } else if (path.includes('/likes') && method === 'POST') {
            activityType = 'like_article';
          } else if (path.includes('/auth/login') && method === 'POST') {
            activityType = 'login';
          }

          // 이벤트 발행 (비동기 처리)
          this.eventEmitter.emit('user.activity', new UserActivityEvent(
            user.id,
            activityType,
            new Date()
          ));
        } catch (error) {
          this.logger.error(`사용자 활동 인터셉터 오류: ${error.message}`, error.stack);
        }
      })
    );
  }
}
