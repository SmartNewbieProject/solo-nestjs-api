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
      statusCode: 400,
      message: [
        '유효한 이메일 주소를 입력해주세요.',
        '비밀번호는 최소 8자 이상이어야 합니다.'
      ],
      error: 'Bad Request'
    }
  }
};

export const signupConflictResponse: ApiResponseOptions = {
  status: 409,
  description: '이미 등록된 이메일',
  schema: {
    example: {
      statusCode: 409,
      message: '이미 등록된 이메일입니다.',
      error: 'Conflict'
    }
  }
};
