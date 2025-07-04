import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateUuidV7 } from '@database/schema/helper';
import * as multer from 'multer';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        'AWS 설정이 올바르게 구성되지 않았습니다. 환경 변수를 확인하세요.',
      );
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucket = bucketName;
  }

  /**
   * 파일을 S3에 업로드합니다.
   * @param file 업로드할 파일 (multer에서 제공하는 파일 객체)
   * @param folder 저장할 폴더 경로 (예: 'profiles', 'posts' 등)
   * @returns 업로드된 파일의 키와 URL
   */
  async uploadFile(
    file: multer.File,
    folder: string = 'uploads',
  ): Promise<{ key: string; url: string }> {
    // 파일 확장자 추출
    const fileExtension = file.originalname.split('.').pop();

    // 고유한 파일 이름 생성
    const fileName = `${generateUuidV7()}.${fileExtension}`;

    // S3 객체 키 (폴더/파일명)
    const key = `${folder}/${fileName}`;

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // 파일 URL 생성
    const url = `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;

    return { key, url };
  }

  /**
   * S3에서 파일을 삭제합니다.
   * @param key 삭제할 파일의 키
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * 파일에 대한 서명된 URL을 생성합니다 (임시 접근용).
   * @param key 파일의 키
   * @param expiresIn URL 만료 시간 (초 단위, 기본 3600초 = 1시간)
   * @returns 서명된 URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * 여러 파일을 S3에 업로드합니다.
   * @param files 업로드할 파일 배열
   * @param folder 저장할 폴더 경로
   * @returns 업로드된 파일들의 키와 URL 배열
   */
  async uploadMultipleFiles(
    files: multer.File[],
    folder: string = 'uploads',
  ): Promise<{ key: string; url: string }[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  }
}
