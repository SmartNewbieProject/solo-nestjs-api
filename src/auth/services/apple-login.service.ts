import { Injectable } from '@nestjs/common';
import { AppleLoginRepository } from '../repository/apple-login.repository';
import { AppleLogin } from '../domain/apple-login';
import { PassLoginResponse } from '../dto/pass-login.dto';
import { AppleLoginRequest } from '../dto/apple-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppleLoginService {
  constructor(
    private readonly appleLoginRepository: AppleLoginRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: AppleLoginRequest): Promise<PassLoginResponse> {
    const appleLogin = new AppleLogin(request.appleId);

    if (!appleLogin.isAppleConnect()) {
      return {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        role: null,
        isNewUser: false,
      };
    }

    const user = await this.appleLoginRepository.findUnsuspendedUserByEmail(
      appleLogin.phoneNumber,
    );

    if (!user) {
      return {
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        expiresIn: null,
        role: null,
        isNewUser: false,
      };
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      role: user.role,
      isNewUser: false,
    };
  }
}
