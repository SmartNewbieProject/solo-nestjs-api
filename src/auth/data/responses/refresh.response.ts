import { ApiResponseOptions } from '@nestjs/swagger';

export const refreshSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '토큰 갱신 성공',
  schema: {
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.X_x-8s8lq_r-lmZKSyVgS5Z-B1D8MjA-Sn9P8YkVJ8c',
      tokenType: 'Bearer',
      expiresIn: 3600
    }
  }
};

export const refreshFailureResponse: ApiResponseOptions = {
  status: 401,
  description: '유효하지 않은 리프레시 토큰',
  schema: {
    example: {
      statusCode: 401,
      message: '유효하지 않은 리프레시 토큰입니다.',
      error: 'Unauthorized'
    }
  }
};
