import { ApiResponseOptions } from '@nestjs/swagger';
import { ReportReason } from '@/types/report';
import { ReportStatus } from '@/types/enum';

export const createReportApiResponse: ApiResponseOptions = {
  status: 201,
  description: '신고 생성 성공',
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' },
      postId: {
        type: 'string',
        example: 'p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e6',
      },
      reporterId: {
        type: 'string',
        example: 'u1v2w3x4-y5z6-a7b8-c9d0-e1f2g3h4i5j6',
      },
      reportedId: {
        type: 'string',
        example: 'v1w2x3y4-z5a6-b7c8-d9e0-f1g2h3i4j5k6',
      },
      reason: { type: 'string', example: ReportReason.HATE_SPEECH },
      status: { type: 'string', example: ReportStatus.PENDING },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-06T04:04:07.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-04-06T04:04:07.000Z',
      },
      deletedAt: { type: 'string', format: 'date-time', example: null },
    },
  },
};
