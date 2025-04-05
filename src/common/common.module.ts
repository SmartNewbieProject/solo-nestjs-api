import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      // 파일 크기 제한 및 필터 설정
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // 스웨거 문서 요청인 경우 필터링 건너뛰기
        if (req.url.includes('/docs') || req.url.includes('/docs-json')) {
          return callback(null, true);
        }
        
        // 이미지 파일만 허용
        if (!file.mimetype.includes('image')) {
          return callback(new Error('이미지 파일만 업로드할 수 있습니다.'), false);
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [],
  providers: [S3Service],
  exports: [S3Service],
})
export class CommonModule {}
