import { ApiResponseOptions } from '@nestjs/swagger';

export const logoutSuccessResponse: ApiResponseOptions = {
  status: 204,
  description: '로그아웃 성공',
  schema: {
    example: null
  }
};

export const logoutFailureResponse: ApiResponseOptions = {
  status: 401,
  description: '인증 실패',
  schema: {
    example: {
      error: '인증되지 않은 사용자입니다.',
    }
  }
};
