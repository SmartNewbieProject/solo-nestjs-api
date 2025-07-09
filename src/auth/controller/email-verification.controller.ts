import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailVerificationService } from '../services/email-verification.service';
import { Public } from '../decorators';
import {
  SendEmailVerificationRequest,
  VerifyEmailCodeRequest,
  SendEmailVerificationResponse,
  VerifyEmailCodeResponse,
} from '../dto/email-verification.dto';

@ApiTags('이메일 인증')
@Controller('auth/email-verification')
@Public()
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '대학교 이메일 인증번호 발송',
    description:
      '허용된 대학교 이메일로 6자리 인증번호를 발송합니다. 인증번호는 3분간 유효합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증번호 발송 성공',
    type: SendEmailVerificationResponse,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (허용되지 않은 이메일 도메인, 중복 발송 등)',
  })
  async sendVerificationCode(
    @Body() request: SendEmailVerificationRequest,
  ): Promise<SendEmailVerificationResponse> {
    return await this.emailVerificationService.sendVerificationCode(request);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '이메일 인증번호 검증',
    description: '발송된 6자리 인증번호를 검증하여 이메일 인증을 완료합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 성공',
    type: VerifyEmailCodeResponse,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (인증번호 불일치, 유효시간 만료 등)',
  })
  @ApiResponse({
    status: 404,
    description: '인증 정보를 찾을 수 없음',
  })
  async verifyCode(
    @Body() request: VerifyEmailCodeRequest,
  ): Promise<VerifyEmailCodeResponse> {
    return await this.emailVerificationService.verifyCode(request);
  }
}
