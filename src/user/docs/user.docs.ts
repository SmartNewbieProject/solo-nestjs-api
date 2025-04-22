import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export const UserDocs = {
  getUserDetails: () => applyDecorators(
    ApiOperation({
      summary: '내 정보 상세 조회',
      description: '로그인한 사용자의 상세 정보를 조회합니다. 프로필 이미지, 대학 정보 등 포함.'
    }),
    ApiResponse({
      status: 200,
      description: '사용자 상세 정보 조회 성공',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '사용자 이름',
            example: '홍길동'
          },
          age: {
            type: 'number',
            description: '나이',
            example: 23
          },
          gender: {
            type: 'string',
            enum: ['MALE', 'FEMALE'],
            description: '성별',
            example: 'MALE'
          },
          profileImages: {
            type: 'array',
            description: '프로필 이미지 목록',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '이미지 ID',
                  example: '01HNGW1234567890ABCDEF001'
                },
                order: {
                  type: 'number',
                  description: '이미지 순서',
                  example: 1
                },
                isMain: {
                  type: 'boolean',
                  description: '대표 이미지 여부',
                  example: true
                },
                url: {
                  type: 'string',
                  description: '이미지 URL',
                  example: 'https://example.com/images/profile.jpg'
                }
              }
            }
          },
          phoneNumber: {
            type: 'string',
            description: '전화번호',
            example: '010-1234-5678'
          },
          instagramId: {
            type: 'string',
            nullable: true,
            description: '인스타그램 ID',
            example: 'instagram_user'
          },
          universityDetails: {
            type: 'object',
            nullable: true,
            description: '대학 정보',
            properties: {
              name: {
                type: 'string',
                description: '대학교 이름',
                example: '서울대학교'
              },
              authentication: {
                type: 'boolean',
                description: '대학 인증 여부',
                example: true
              },
              department: {
                type: 'string',
                description: '학과',
                example: '컴퓨터공학과'
              },
              grade: {
                type: 'string',
                description: '학년',
                example: '3'
              },
              studentNumber: {
                type: 'string',
                description: '학번',
                example: '2020123456'
              }
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: '인증 실패',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Unauthorized'
          }
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: '사용자 정보를 찾을 수 없음',
      schema: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: '사용자 정보를 찾을 수 없습니다.'
          }
        }
      }
    })
  ),

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