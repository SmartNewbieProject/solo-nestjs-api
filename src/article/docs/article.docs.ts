import { ApiResponseOptions } from '@nestjs/swagger';

export const createArticleApiResponse: ApiResponseOptions = {
  status: 201,
  description: '게시글 생성 성공',
};

export const getArticlesApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 목록 조회 성공',
  schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
            authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
            content: { type: 'string', example: '오늘은 날씨가 정말 좋네요!' },
            anonymous: { type: 'string', example: 'Y' },
            emoji: { type: 'string', example: '😊' },
            likeCount: { type: 'number', example: 0 },
            isLiked: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
            deletedAt: { type: 'string', format: 'date-time', example: null },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
                name: { type: 'string', example: '홍길동' },
                email: { type: 'string', example: 'user@example.com' }
              }
            },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6' },
                  content: { type: 'string', example: '정말 좋은 글이네요!' },
                  createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:10:07.000Z' }
                }
              }
            }
          }
        }
      },
      meta: {
        type: 'object',
        properties: {
          currentPage: { type: 'number', example: 1 },
          itemsPerPage: { type: 'number', example: 10 },
          totalItems: { type: 'number', example: 100 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false }
        }
      }
    }
  }
};

export const updateArticleApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 수정 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '수정된 게시글 내용입니다!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '😊' },
      likeCount: { type: 'number', example: 0 },
      isLiked: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T05:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: null }
    }
  }
};

export const deleteArticleApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 삭제 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '오늘은 날씨가 정말 좋네요!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '😊' },
      likeCount: { type: 'number', example: 0 },
      isLiked: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: '2025-04-06T05:04:07.000Z' }
    }
  }
};

export const getArticleByIdApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 상세 조회 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '오늘은 날씨가 정말 좋네요!' },
      anonymous: { type: 'string', example: 'Y' },
      emoji: { type: 'string', example: '😊' },
      likeCount: { type: 'number', example: 0 },
      isLiked: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: null },
      author: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
          name: { type: 'string', example: '홍길동' },
          email: { type: 'string', example: 'user@example.com' }
        }
      },
      comments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'c1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6' },
            content: { type: 'string', example: '정말 좋은 글이네요!' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:10:07.000Z' },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
                name: { type: 'string', example: '김철수' },
                email: { type: 'string', example: 'user2@example.com' }
              }
            }
          }
        }
      }
    }
  }
};

export const likeArticleApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 좋아요 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '오늘은 날씨가 정말 좋네요!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '😊' },
      likeCount: { type: 'number', example: 1 },
      isLiked: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: null }
    }
  }
};

export const getArticleCategoriesApiResponse: ApiResponseOptions = {
  status: 200,
  description: '게시글 카테고리 목록 조회 성공',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'general',
          description: '카테고리 코드',
          enum: ['general', 'review', 'love-concerns']
        },
        displayName: {
          type: 'string',
          example: '실시간',
          description: '화면에 표시될 카테고리 이름'
        },
        emojiUrl: {
          type: 'string',
          example: 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/realtime.png',
          description: '카테고리 이모지 이미지 URL'
        }
      }
    }
  }
};
