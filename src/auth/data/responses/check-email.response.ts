import { ApiResponseOptions } from '@nestjs/swagger';

export const checkEmailSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '이메일 중복 확인 성공',
  schema: {
    example: {
      exists: true // 또는 false
    }
  }
};

export const checkEmailFailureResponse: ApiResponseOptions = {
  status: 400,
  description: '잘못된 요청 데이터',
  schema: {
    example: {
      statusCode: 400,
      message: '유효한 이메일 주소를 입력해주세요.',
      error: 'Bad Request'
    }
  }
};
