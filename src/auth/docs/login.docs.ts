import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  loginSuccessResponse,
  loginFailureResponse,
  refreshSuccessResponse,
  refreshFailureResponse,
  logoutSuccessResponse,
  logoutFailureResponse
} from '../data/responses';

export const AuthDocs = {
  controller: () => applyDecorators(
    ApiTags('인증')
  ),

  login: () => applyDecorators(
    ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' }),
    ApiResponse(loginSuccessResponse),
    ApiResponse(loginFailureResponse)
  ),

  refresh: () => applyDecorators(
    ApiOperation({ summary: '토큰 갱신', description: '쿠키에 저장된 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.' }),
    ApiResponse(refreshSuccessResponse),
    ApiResponse(refreshFailureResponse)
  ),

  logout: () => applyDecorators(
    ApiOperation({ summary: '로그아웃', description: '현재 사용자를 로그아웃합니다.' }),
    ApiResponse(logoutSuccessResponse),
    ApiResponse(logoutFailureResponse)
  ),

  withdraw: () => applyDecorators(
    ApiOperation({
      summary: '회원 탈퇴',
      description: '사용자를 탈퇴합니다. 비밀번호를 받아 유효성검증을 수행하고, 탈퇴 사유를 수집합니다.'
    }),
    ApiResponse({
      status: 201,
      description: '탈퇴 성공',
      schema: {
        example: {
          message: '탈퇴가 성공적으로 처리되었습니다.',
          withdrawnAt: '2025-04-23T12:34:56.789Z',
          serviceDurationDays: 120
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: '인증 실패',
      schema: {
        example: {
          statusCode: 401,
          message: '비밀번호가 올바르지 않습니다.',
          error: 'Unauthorized'
        }
      }
    }),
    ApiResponse({
      status: 502,
      description: '탈퇴 처리 오류',
      schema: {
        example: {
          statusCode: 502,
          message: '탈퇴 처리 중 오류가 발생했습니다.',
          error: 'Bad Gateway'
        }
      }
    })
  )
};
