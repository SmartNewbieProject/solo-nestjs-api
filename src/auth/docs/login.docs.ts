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
    ApiOperation({ summary: '회원 탈퇴', description: '사용자를 탈퇴합니다. 비밀번호를 받아 유효성검증을 수행합니다.' })
  )
};
