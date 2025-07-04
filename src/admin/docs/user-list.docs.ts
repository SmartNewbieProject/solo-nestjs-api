import { ApiResponseOptions } from '@nestjs/swagger';

export const getUsersListApiResponse: ApiResponseOptions = {
  status: 200,
  description: '회원 목록 조회 성공',
  schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', example: '홍길동' },
            age: { type: 'number', example: 25 },
            gender: { type: 'string', example: 'MALE' },
            profileImages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  order: { type: 'number' },
                  isMain: { type: 'boolean' },
                  url: { type: 'string' },
                },
              },
            },
            universityDetails: {
              type: 'object',
              nullable: true,
              properties: {
                name: { type: 'string' },
                authentication: { type: 'boolean' },
                department: { type: 'string' },
              },
            },
            preferences: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  typeName: { type: 'string' },
                  selectedOptions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        displayName: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      meta: {
        type: 'object',
        properties: {
          currentPage: { type: 'number', example: 1 },
          itemsPerPage: { type: 'number', example: 10 },
          totalItems: { type: 'number', example: 100 },
          totalPages: { type: 'number', example: 10 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false },
        },
      },
    },
  },
};
