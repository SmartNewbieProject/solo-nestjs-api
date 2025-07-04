import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadResponse } from '@/common/dto/file-upload.dto';

export const ImageDocs = {
  controller: () => applyDecorators(ApiTags('프로필 이미지')),

  uploadProfileImage: () =>
    applyDecorators(
      ApiOperation({
        summary: '프로필 이미지 업로드 (다중)',
        description:
          '여러 프로필 이미지를 업로드하고 사용자 프로필에 연결합니다.',
      }),
      ApiConsumes('multipart/form-data'),
      ApiResponse({
        status: 201,
        description: '프로필 이미지 업로드 성공',
        type: [FileUploadResponse],
      }),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
            isMain: {
              type: 'string',
              description:
                '대표 이미지로 설정할 파일의 인덱스 (0부터 시작, 선택적)',
              example: '0',
            },
          },
        },
      }),
    ),

  deleteProfileImage: () =>
    applyDecorators(
      ApiOperation({
        summary: '프로필 이미지 삭제',
        description: '프로필 이미지를 삭제합니다.',
      }),
      ApiParam({ name: 'id', description: '프로필 이미지 ID' }),
      ApiResponse({
        status: 200,
        description: '이미지 삭제 성공',
      }),
    ),

  setMainProfileImage: () =>
    applyDecorators(
      ApiOperation({
        summary: '대표 프로필 이미지 설정',
        description: '특정 이미지를 대표 프로필 이미지로 설정합니다.',
      }),
      ApiParam({ name: 'id', description: '프로필 이미지 ID' }),
      ApiResponse({
        status: 200,
        description: '대표 이미지 설정 성공',
      }),
    ),
};
