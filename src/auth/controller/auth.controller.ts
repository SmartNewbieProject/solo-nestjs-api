import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequest, TokenResponse } from '../dto';

@Controller('auth')
@ApiTags('인증')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: TokenResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginRequest: LoginRequest): Promise<TokenResponse> {
    return this.authService.login(loginRequest);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신', description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: TokenResponse })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(@Body() { refreshToken }: { refreshToken: string }): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '로그아웃', description: '현재 사용자를 로그아웃합니다.' })
  @ApiResponse({ status: 204, description: '로그아웃 성공' })
  async logout(@Body() { userId, refreshToken }: { userId: string, refreshToken: string }): Promise<void> {
    return this.authService.logout(userId, refreshToken);
  }
}
