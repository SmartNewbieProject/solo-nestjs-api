import { ApiResponseOptions } from '@nestjs/swagger';

export const signupSuccessResponse: ApiResponseOptions = {
  status: 201,
  description: '회원가입 성공',
  schema: {
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      email: 'user@example.com',
      name: '홍길동',
      createdAt: '2025-04-04T12:39:45.000Z',
      updatedAt: '2025-04-04T12:39:45.000Z'
    }
  }
};

export const signupValidationFailureResponse: ApiResponseOptions = {
  status: 400,
  description: '잘못된 요청 데이터',
  schema: {
    example: {
      error: '비밀번호는 최소 8자 이상이어야 합니다.'
    }
  }
};

export const signupConflictResponse: ApiResponseOptions = {
  status: 409,
  description: '이미 등록된 이메일',
  schema: {
    example: {
      error: '이미 등록된 이메일입니다.',
    }
  }
};
