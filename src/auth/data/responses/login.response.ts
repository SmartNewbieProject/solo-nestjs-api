import { ApiResponseOptions } from '@nestjs/swagger';

export const loginSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '로그인 성공',
  schema: {
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.X_x-8s8lq_r-lmZKSyVgS5Z-B1D8MjA-Sn9P8YkVJ8c',
      tokenType: 'Bearer',
      expiresIn: 3600,
      roles: 'user',
    },
  },
};

export const loginFailureResponse: ApiResponseOptions = {
  status: 401,
  description: '인증 실패',
  schema: {
    example: {
      error: '이메일 또는 비밀번호가 올바르지 않습니다.',
    },
  },
};
