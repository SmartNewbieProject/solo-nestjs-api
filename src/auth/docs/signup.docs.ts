import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  signupSuccessResponse,
  signupValidationFailureResponse,
  signupConflictResponse,
  checkEmailSuccessResponse,
  checkEmailFailureResponse,
} from '../data/responses';

export const SignupDocs = {
  controller: () => applyDecorators(ApiTags('인증')),

  signup: () =>
    applyDecorators(
      ApiOperation({
        summary: '회원가입',
        description: '새로운 사용자를 등록합니다.',
      }),
      ApiResponse(signupSuccessResponse),
      ApiResponse(signupValidationFailureResponse),
      ApiResponse(signupConflictResponse),
    ),

  checkEmail: () =>
    applyDecorators(
      ApiOperation({
        summary: '이메일 중복 확인',
        description: '이메일이 이미 등록된지 확인합니다.',
      }),
      ApiResponse(checkEmailSuccessResponse),
      ApiResponse(checkEmailFailureResponse),
    ),
};
