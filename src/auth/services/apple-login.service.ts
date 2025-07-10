import { Injectable, BadRequestException } from '@nestjs/common';
import { AppleLoginRepository } from '../repository/apple-login.repository';
import { AppleLogin } from '../domain/apple-login';
import { PassLoginResponse } from '../dto/pass-login.dto';
import { AppleLoginRequest } from '../dto/apple-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '@auth/repository/auth.repository';

@Injectable()
export class AppleLoginService {
  constructor(
    private readonly appleLoginRepository: AppleLoginRepository,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async login(request: AppleLoginRequest): Promise<PassLoginResponse> {
    const appleLogin = new AppleLogin(request.appleId);

    if (!appleLogin.isAppleConnect()) {
      throw new BadRequestException('계정이 잘못되었습니다');
    }

    const user = await this.appleLoginRepository.findUnsuspendedUserByEmail(
      appleLogin.phoneNumber,
    );
    if (!user) {
      throw new BadRequestException('사용자를 찾을수 없습니다');
    }

    const genderResult = await this.authRepository.findGenderByUserId(user.id);
    if (!genderResult) {
      throw new BadRequestException('사용자의 성별이 없습니다');
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      gender: genderResult.gender,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
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
