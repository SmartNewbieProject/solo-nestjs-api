import { BadGatewayException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginRequest, TokenResponse } from '../dto';
import { Role } from '../domain/user-role.enum';
import { AuthRepository } from '../repository/auth.repository';
import { Gender } from '@/types/enum';

interface JwtPayload {
  email: string;
  id: string;
  role: Role;
  gender: Gender;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async login(loginRequest: LoginRequest): Promise<TokenResponse> {
    const { email, password } = loginRequest;

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const genderResult = await this.authRepository.findGenderByUserId(user.id);

    if (!genderResult) {  
      throw new BadGatewayException("성별정보가 없습니다.");
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, genderResult.gender);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, role: user.role };
  }

  async withdraw(userId: string, password: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // await this.authRepository.deleteUser(userId);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration: false,  // 만료 검사 활성화
      });

      const storedToken = await this.authRepository.findRefreshToken(payload.id, refreshToken);
      this.logger.debug("storedToken: " + storedToken);
      if (!storedToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const user = await this.authRepository.findUserById(payload.id);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const genderResult = await this.authRepository.findGenderByUserId(user.id);

      if (!genderResult) {
        throw new BadGatewayException("성별정보가 없습니다.");
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role, genderResult.gender);
      await this.authRepository.updateRefreshToken(user.id, refreshToken, tokens.refreshToken);

      return tokens;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.authRepository.removeRefreshToken(userId, refreshToken);
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async generateTokens(userId: string, email: string, role: Role, gender: Gender): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, email, role, gender },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '1h',  // Access Token: 1시간
        },
      ),
      this.jwtService.signAsync(
        { id: userId, email, role, gender },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '7d',  // Refresh Token: 7일
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,  // Access Token의 만료시간(초)
      role,
    };
  }
}
