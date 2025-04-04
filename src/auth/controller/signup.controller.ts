import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Email, SignupRequest } from '../dto';

@Controller('auth')
@ApiTags('인증')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 409, description: '이미 등록된 이메일' })
  async signup(@Body() signupRequest: SignupRequest) {
    return await this.signupService.signup(signupRequest);
  }

  @Post('check/email')
  @ApiOperation({ summary: '이메일 중복 확인', description: '이메일이 이미 등록된지 확인합니다.' })
  @ApiResponse({ status: 200, description: '이메일 중복 확인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async checkEmail(@Body() { email }: Email) {
    const exists = await this.signupService.checkEmail(email);
    return { exists };
  }
}
