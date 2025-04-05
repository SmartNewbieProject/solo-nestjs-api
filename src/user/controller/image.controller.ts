import { Controller, Post, Delete, Param, Body, UseInterceptors, UploadedFiles, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import * as multer from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { S3Service } from '@/common/services/s3.service';
import { ImageService } from '../services/image.service';
import { ImageDocs } from '../docs/image.docs';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('profile/images')
@ImageDocs.controller()
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export class ImageController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ImageDocs.uploadProfileImage()
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
  @ImageDocs.deleteProfileImage()
  async deleteProfileImage(
    @Param('id') profileImageId: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.imageService.deleteProfileImage(user.id, profileImageId);
  }

  @Post(':id/main')
  @ImageDocs.setMainProfileImage()
  async setMainProfileImage(
    @Param('id') profileImageId: string,
    @CurrentUser() user: AuthenticationUser,
  ) {
    return await this.imageService.setMainProfileImage(user.id, profileImageId);
  }
}
