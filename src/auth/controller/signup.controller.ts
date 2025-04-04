import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Email, SignupRequest } from '../dto';
import {
  signupSuccessResponse,
  signupValidationFailureResponse,
  signupConflictResponse,
  checkEmailSuccessResponse,
  checkEmailFailureResponse
} from '../data/responses';
import { Public } from '@auth/decorators';

@Controller('auth')
@ApiTags('인증')
@Public()
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse(signupSuccessResponse)
  @ApiResponse(signupValidationFailureResponse)
  @ApiResponse(signupConflictResponse)
  async signup(@Body() signupRequest: SignupRequest) {
    return await this.signupService.signup(signupRequest);
  }

  @Post('check/email')
  @ApiOperation({ summary: '이메일 중복 확인', description: '이메일이 이미 등록된지 확인합니다.' })
  @ApiResponse(checkEmailSuccessResponse)
  @ApiResponse(checkEmailFailureResponse)
  async checkEmail(@Body() { email }: Email) {
    const exists = await this.signupService.checkEmail(email);
    return { exists };
  }
}
