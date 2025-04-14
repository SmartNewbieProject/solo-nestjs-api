import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, TokenResponse, WithdrawRequest } from '../dto';
import { CurrentUser, Public, Roles } from '@auth/decorators';
import { AuthenticationUser } from '@/types';
import { AuthDocs } from '@auth/docs';
import { Role } from '@auth/domain/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@AuthDocs.controller()
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const result = await this.authService.login(loginRequest);

    this.setRefreshTokenCookie(response, result.refreshToken);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AuthDocs.refresh()
  async refresh(
    @Body() { refreshToken }: { refreshToken: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const result = await this.authService.refreshToken(refreshToken);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthDocs.logout()
  async logout(
    @CurrentUser() user: AuthenticationUser,
    @Body() { refreshToken }: { refreshToken: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(user.id, refreshToken);
    this.clearRefreshTokenCookie(response);
  }

  @Delete('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @AuthDocs.withdraw()
  async withdraw(
    @CurrentUser() user: AuthenticationUser,
    @Body() withdrawRequest: WithdrawRequest,
  ) {
    return await this.authService.withdraw(user.id, withdrawRequest.password);
  }
}
