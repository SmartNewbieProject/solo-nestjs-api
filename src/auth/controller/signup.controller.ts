import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { InstagramId, SignupRequest } from '../dto';
import { Public } from '@auth/decorators';
import { SignupDocs } from '../docs/signup.docs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as multer from 'multer';
import { CheckPhoneNumber } from '@auth/dto/signup';

@Controller('auth')
@SignupDocs.controller()
@Public()
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  @ApiConsumes('multipart/form-data')
  @SignupDocs.signup()
  @UseInterceptors(
    FilesInterceptor('profileImages', 3, {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async signup(
    @Body() signupRequest: SignupRequest,
    @UploadedFiles() files: multer.File[],
  ) {
    signupRequest.profileImages = files;
    if (!files || files.length === 0) {
      throw new BadRequestException('프로필 이미지는 필수입니다.');
    }

    if (files.length > 3) {
      throw new BadRequestException(
        '프로필 이미지는 최대 3개까지 업로드 가능합니다.',
      );
    }

    return await this.signupService.signup({
      ...signupRequest,
      profileImages: files,
    });
  }

  @Post('check/instagram')
  async existsInstagram(@Body() { instagramId }: InstagramId) {
    return { exists: await this.signupService.validateInstagram(instagramId) };
  }

  @ApiOperation({
    summary: '번호 중복 체크 조회 API',
    description: '이미 가입된 번호인지 조회하여 반환합니다',
  })
  @ApiResponse({
    example: { exists: true },
  })
  @Post('check/phone-number')
  async checkExistsPhoneNumber(@Body() { phoneNumber }: CheckPhoneNumber) {
    const exists = await this.signupService.checkExistsPhoneNumber(phoneNumber);
    return { exists };
  }
}
