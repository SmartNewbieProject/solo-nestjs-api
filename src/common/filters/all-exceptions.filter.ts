import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@common/interfaces';
import { SlackService } from '@/slack-notification/slack.service';

/**
 * 모든 예외를 처리하는 전역 필터
 * 오류 발생 시 error 필드로 오류 메시지를 반환합니다.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly slackService: SlackService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error('서버 오류', {
          path: request.path,
          method: request.method,
          error: exception.stack || exception.message,
        });

        const errorContext = {
          path: request.path,
          method: request.method,
          timestamp: new Date().toISOString(),
          error: exception.stack || exception.message,
          exception,
          user: request.user,
        };

        this.slackService.sendErrorNotification(
          exception as Error,
          errorContext,
        );
      }

      // 유효성 검사 오류 처리 (class-validator에서 발생)
      if (
        status === HttpStatus.BAD_REQUEST &&
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        const errorResponse: ApiErrorResponse = {
          error: exceptionResponse.message[0], // 첫 번째 오류 메시지만 반환
        };

        return response.status(status).json(errorResponse);
      }

      // 일반 HTTP 예외 처리
      const errorResponse: ApiErrorResponse = {
        error:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message || exception.message,
      };

      return response.status(status).json(errorResponse);
    }

    // HttpException이 아닌 일반 에러 처리
    const errorResponse: ApiErrorResponse = {
      error: '서버 내부 오류가 발생했습니다.',
    };

    // 일반 에러도 로깅
    this.logger.error('예상치 못한 서버 오류', {
      error: exception instanceof Error ? exception.stack : String(exception),
      path: request.path,
      method: request.method,
    });

    const errorContext = {
      path: request.path,
      method: request.method,
      timestamp: new Date().toISOString(),
      error: (exception as any).stack || (exception as any).message,
      exception,
      user: request.user,
    };

    this.slackService.sendErrorNotification(exception as Error, errorContext);

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}
