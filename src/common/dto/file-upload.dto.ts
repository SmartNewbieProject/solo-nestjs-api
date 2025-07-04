import { ApiProperty } from '@nestjs/swagger';
import * as multer from 'multer';

export class FileUpload {
  @ApiProperty({
    type: 'array',
    format: 'binary',
    description: '업로드할 이미지 파일',
  })
  file: multer.File[];
}

export class FileUploadResponse {
  @ApiProperty({
    description: '업로드된 파일의 URL',
    example:
      'https://your-bucket.s3.ap-northeast-2.amazonaws.com/profiles/123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  url: string;
}

export class MultipleFileUploadResponse {
  @ApiProperty({
    description: '업로드된 파일들의 정보',
    type: [FileUploadResponse],
  })
  files: FileUploadResponse[];
}
