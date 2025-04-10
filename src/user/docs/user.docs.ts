import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const UserDocs = {
  updatePassword: () => applyDecorators(
    ApiOperation({ 
      summary: '비밀번호 변경', 
      description: '현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.' 
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: {
            type: 'string',
            description: '현재 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)',
            minLength: 8,
            example: 'current123!'
          },
          newPassword: {
            type: 'string',
            description: '새로운 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)',
            minLength: 8,
            pattern: '^(?=.*[A-Za-z])(?=.*\\d)(?=.*\\W)[A-Za-z\\d\\W_]{8,}$',
            example: 'newPassword123!'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 200, 
      description: '비밀번호 변경 성공' 
    }),
    ApiResponse({ 
      status: 400,
      description: '잘못된 비밀번호 형식',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: '비밀번호는 최소 8자 이상이며, 문자와 숫자, 특수문자를 포함해야 합니다.'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400,
      description: '현재 비밀번호가 일치하지 않음',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: '현재 비밀번호가 일치하지 않습니다.'
          }
        }
      }
    })
  )
}; 