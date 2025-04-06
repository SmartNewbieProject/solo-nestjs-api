import { ApiResponseOptions } from '@nestjs/swagger';

export const createCommentApiResponse: ApiResponseOptions = {
  status: 201,
  description: '댓글 생성 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      postId: { type: 'string', example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '정말 좋은 게시글이네요!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '😊' },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: null }
    }
  }
};

export const getCommentsByPostIdApiResponse: ApiResponseOptions = {
  status: 200,
  description: '댓글 목록 조회 성공',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
        postId: { type: 'string', example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6' },
        authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
        content: { type: 'string', example: '정말 좋은 게시글이네요!' },
        anonymous: { type: 'string', example: '귀여운 고양이' },
        emoji: { type: 'string', example: '😊' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
        deletedAt: { type: 'string', format: 'date-time', example: null }
      }
    }
  }
};

export const updateCommentApiResponse: ApiResponseOptions = {
  status: 200,
  description: '댓글 수정 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      postId: { type: 'string', example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '수정된 댓글 내용입니다!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '🎉' },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T05:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: null }
    }
  }
};

export const deleteCommentApiResponse: ApiResponseOptions = {
  status: 200,
  description: '댓글 삭제 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      postId: { type: 'string', example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6' },
      authorId: { type: 'string', example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6' },
      content: { type: 'string', example: '정말 좋은 게시글이네요!' },
      anonymous: { type: 'string', example: '귀여운 고양이' },
      emoji: { type: 'string', example: '😊' },
      createdAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2025-04-06T04:04:07.000Z' },
      deletedAt: { type: 'string', format: 'date-time', example: '2025-04-06T05:04:07.000Z' }
    }
  }
};
