import { Body, Controller, Post, HttpCode, HttpStatus, Request, Res, Delete } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, TokenResponse, WithdrawRequest } from '../dto';
import { UnauthorizedException } from '@nestjs/common';
import { CurrentUser, Public } from '@auth/decorators';
import { AuthenticationUser } from '@/types';
import { AuthDocs } from '../docs/login.docs';

@Controller('auth')
@AuthDocs.controller()
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
  @AuthDocs.login()
  @Public()
  async login(
    @Body() loginRequest: LoginRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    const result = await this.authService.login(loginRequest);
    
    this.setRefreshTokenCookie(response, result.refreshToken);
    
    const { refreshToken, role, ...tokenResponse } = result;
    return { ...tokenResponse, role };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AuthDocs.refresh()
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
  @AuthDocs.logout()
  @Public()
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

  @Delete('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @AuthDocs.withdraw()
  async withdraw(@CurrentUser() user: AuthenticationUser, @Body() withdrawRequest: WithdrawRequest) {
    return await this.authService.withdraw(user.id, withdrawRequest.password);
  }

}
