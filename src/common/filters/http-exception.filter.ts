import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@common/interfaces';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (
      status === HttpStatus.BAD_REQUEST &&
      exceptionResponse.message &&
      Array.isArray(exceptionResponse.message)
    ) {
      const errorResponse: ApiErrorResponse = {
        error: exceptionResponse.message[0],
      };

      return response.status(status).json(errorResponse);
    }

    const errorResponse: ApiErrorResponse = {
      error:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || exception.message,
    };

    return response.status(status).json(errorResponse);
  }
}
