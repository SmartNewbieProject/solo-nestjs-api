import { Body, Controller, Post, Patch, UseInterceptors, UploadedFiles, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { Email, InstagramId, SignupRequest } from '../dto';
import { Public } from '@auth/decorators';
import { SignupDocs } from '../docs/signup.docs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import * as multer from 'multer';
import { SmsCodeCreation, AuthorizeSmsCode } from '../dto/signup';

@Controller('auth')
@SignupDocs.controller()
@Public()
export class SignupController {
  constructor(private readonly signupService: SignupService) { }

  @Post('signup')
  @ApiConsumes('multipart/form-data')
  @SignupDocs.signup()
  @UseInterceptors(FilesInterceptor('profileImages', 3, {
    limits: {
      fileSize: 20 * 1024 * 1024,
    }
  }))
  async signup(
    @Body() signupRequest: SignupRequest,
    @UploadedFiles() files: multer.File[]
  ) {
    signupRequest.profileImages = files;
    if (!files || files.length === 0) {
      throw new BadRequestException('프로필 이미지는 필수입니다.');
    }

    if (files.length > 3) {
      throw new BadRequestException('프로필 이미지는 최대 3개까지 업로드 가능합니다.');
    }

    return await this.signupService.signup({
      ...signupRequest,
      profileImages: files,
    });
  }


  @ApiOperation({ summary: '인증번호 전송', description: '인증번호를 전송합니다.' })
  @Post('sms/send')
  @HttpCode(HttpStatus.CREATED)
  async sendSmsCode(@Body() { phoneNumber }: SmsCodeCreation) {
    const uniqueKey = await this.signupService.sendVerificationcCode(phoneNumber);
    return { uniqueKey };
  }

  @ApiOperation({ summary: '인증번호 인증', description: 'SMS 인증을 수행합니다.' })
  @Patch('sms')
  async matchSmsCode(@Body() { authorizationCode, uniqueKey }: AuthorizeSmsCode) {
    await this.signupService.matchVerificationCode(uniqueKey, authorizationCode);
  }


  @Post('check/email')
  @SignupDocs.checkEmail()
  async checkEmail(@Body() { email }: Email) {
    const exists = await this.signupService.checkEmail(email);
    return { exists };
  }

  @Post('check/instagram')
  async existsInstagram(@Body() { instagramId }: InstagramId) {
    return { exists: await this.signupService.validateInstagram(instagramId) };
  }
}
