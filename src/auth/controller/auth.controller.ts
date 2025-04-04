import { Body, Controller, Post, HttpCode, HttpStatus, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequest, TokenResponse } from '../dto';
import { UnauthorizedException } from '@nestjs/common';
import {
  loginSuccessResponse,
  loginFailureResponse,
  refreshSuccessResponse,
  refreshFailureResponse,
  logoutSuccessResponse,
  logoutFailureResponse
} from '../data/responses';

@Controller('auth')
@ApiTags('인증')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  private setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiResponse(loginSuccessResponse)
  @ApiResponse(loginFailureResponse)
  async login(
    @Body() loginRequest: LoginRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    const result = await this.authService.login(loginRequest);
    
    this.setRefreshTokenCookie(response, result.refreshToken);
    
    const { refreshToken, ...tokenResponse } = result;
    return tokenResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신', description: '쿠키에 저장된 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.' })
  @ApiResponse(refreshSuccessResponse)
  @ApiResponse(refreshFailureResponse)
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) response: Response
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    const refreshToken = req.cookies['refresh_token'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    
    this.setRefreshTokenCookie(response, result.refreshToken);
    const { refreshToken: newRefreshToken, ...tokenResponse } = result;
    return tokenResponse;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '로그아웃', description: '현재 사용자를 로그아웃합니다.' })
  @ApiResponse(logoutSuccessResponse)
  @ApiResponse(logoutFailureResponse)
  async logout(
    @Body() { userId }: { userId: string },
    @Request() req,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    const refreshToken = req.cookies['refresh_token'];
    
    if (refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }
    
    this.clearRefreshTokenCookie(response);
  }
}
