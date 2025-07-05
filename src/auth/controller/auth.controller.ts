import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, TokenResponse, WithdrawRequest } from '../dto';
import { PassLoginRequest, PassLoginResponse } from '../dto/pass-login.dto';
import { CurrentUser, Public, Roles } from '@auth/decorators';
import { AuthenticationUser } from '@/types';
import { AuthDocs } from '@auth/docs';
import { Role } from '@auth/domain/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RefreshToken } from '../dto/token';

@Controller('auth')
@AuthDocs.controller()
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일을 밀리초로 표현
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

  @Post('pass-login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async passLogin(
    @Body() passLoginRequest: PassLoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PassLoginResponse> {
    const result = await this.authService.passLogin(passLoginRequest);

    if (result.refreshToken) {
      this.setRefreshTokenCookie(response, result.refreshToken);
    }

    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AuthDocs.refresh()
  async refresh(
    @Body() token: RefreshToken,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<TokenResponse, 'refreshToken'>> {
    this.logger.debug(`refresh: ${token.refreshToken}`);

    // 토큰 값 상세 로깅
    this.logger.debug(`토큰 길이: ${token.refreshToken?.length}`);
    this.logger.debug(
      `토큰 처음 10자: ${token.refreshToken?.substring(0, 10)}`,
    );
    this.logger.debug(
      `토큰 마지막 10자: ${token.refreshToken?.substring(token.refreshToken.length - 10)}`,
    );

    // 토큰에 이상한 문자가 있는지 확인
    const hasSpecialChars = /[\s\n\r\t]/g.test(token.refreshToken);
    if (hasSpecialChars) {
      this.logger.debug('토큰에 이상한 문자가 포함되어 있습니다.');

      // 이상한 문자 제거
      const cleanToken = token.refreshToken.replace(/[\s\n\r\t]/g, '');
      this.logger.debug(`정제된 토큰 길이: ${cleanToken.length}`);
      token.refreshToken = cleanToken;
    }

    const result = await this.authService.refreshToken(token.refreshToken);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthDocs.logout()
  async logout(
    @CurrentUser() user: AuthenticationUser,
    @Body() token: RefreshToken,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(user.id, token.refreshToken);
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
