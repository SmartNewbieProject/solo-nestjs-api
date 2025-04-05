import { Controller, Post, Delete, Param, Body, UseInterceptors, UploadedFiles, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import * as multer from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { S3Service } from '@/common/services/s3.service';
import { ImageService } from '../services/image.service';
import { FileUploadResponse } from '@/common/dto/file-upload.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('profile/images')
@ApiTags('프로필 이미지')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export class ImageController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '프로필 이미지 업로드 (다중)', description: '여러 프로필 이미지를 업로드하고 사용자 프로필에 연결합니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: '프로필 이미지 업로드 성공',
    type: [FileUploadResponse]
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        },
        isMain: {
          type: 'string',
          description: '대표 이미지로 설정할 파일의 인덱스 (0부터 시작, 선택적)',
          example: '0'
        }
      }
    }
  })
  @UseInterceptors(FilesInterceptor('files', 3))
  async uploadProfileImage(
    @UploadedFiles() files: multer.File[],
    @CurrentUser() user: AuthenticationUser,
    @Body('isMain') mainIndex: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('파일이 제공되지 않았습니다.');
    }
    const invalidFiles = files.filter(file => !file.mimetype.includes('image'));
    if (invalidFiles.length > 0) {
      throw new BadRequestException('이미지 파일만 업로드할 수 있습니다.');
    }

    const folder = `profiles/${user.id}`;
    const mainFileIndex = mainIndex ? parseInt(mainIndex, 10) : -1;

    const uploadImagePromises = files.map(async (file, index) => {
      const isMain = index === mainFileIndex;
      const result = await this.s3Service.uploadFile(file, folder);
      return await this.imageService.saveProfileImage(
        user.id,
        result.key,
        result.url,
        isMain,
      );
    });

    const results = await Promise.all(uploadImagePromises);
    return results;
  }

  @Delete(':id')
  @ApiOperation({ summary: '프로필 이미지 삭제', description: '프로필 이미지를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '프로필 이미지 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '이미지 삭제 성공'
  })
  async deleteProfileImage(
    @Param('id') profileImageId: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.imageService.deleteProfileImage(user.id, profileImageId);
  }

  @Post(':id/main')
  @ApiOperation({ summary: '대표 프로필 이미지 설정', description: '특정 이미지를 대표 프로필 이미지로 설정합니다.' })
  @ApiParam({ name: 'id', description: '프로필 이미지 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '대표 이미지 설정 성공',
  })
  async setMainProfileImage(
    @Param('id') profileImageId: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.imageService.setMainProfileImage(user.id, profileImageId);
  }
}
