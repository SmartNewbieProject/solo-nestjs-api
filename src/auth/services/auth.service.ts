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
      this.logger.log(`리프레시 토큰 검증, 토큰 길이: ${refreshToken?.length}`);
      this.logger.log(`JWT_SECRET: ${this.configService.get<string>('JWT_SECRET')?.substring(0, 3)}...`);

      // 토큰 디코딩 시도 (검증 없이)
      try {
        const decoded = this.jwtService.decode(refreshToken);
        this.logger.log(`토큰 디코딩 결과: ${JSON.stringify(decoded)}`);
      } catch (decodeError) {
        this.logger.error(`토큰 디코딩 실패: ${decodeError.message}`);
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.logger.log(`토큰 검증 성공, payload: ${JSON.stringify(payload)}`);

      const storedToken = await this.authRepository.findRefreshToken(payload.id, refreshToken);
      if (!storedToken) {
        this.logger.log("저장된 리프레시토큰이 없음");
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
      this.logger.error("리프레시 토큰 검증 실패");
      this.logger.error(`오류 타입: ${error.name}, 메시지: ${error.message}`);
      this.logger.error(`오류 상세: ${JSON.stringify(error)}`);

      if (error.name === 'JsonWebTokenError') {
        if (error.message === 'invalid token') {
          throw new UnauthorizedException('토큰 형식이 잘못되었습니다.');
        } else if (error.message === 'jwt malformed') {
          throw new UnauthorizedException('JWT 토큰 형식이 잘못되었습니다.');
        } else if (error.message === 'invalid signature') {
          throw new UnauthorizedException('토큰 서명이 유효하지 않습니다.');
        }
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
      }

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
    this.logger.log(`토큰 생성 시작 - userId: ${userId}, email: ${email}, role: ${role}, gender: ${gender}`);

    // Access Token 생성 (1시간)
    const accessToken = await this.jwtService.signAsync(
      { id: userId, email, role, gender },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );
    this.logger.log(`액세스 토큰 생성 완료, 길이: ${accessToken.length}`);

    // Refresh Token 생성 (7일)
    const refreshToken = await this.jwtService.signAsync(
      { id: userId, email, role, gender },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );
    this.logger.log(`리프레시 토큰 생성 완료, 길이: ${refreshToken.length}`);

    // 리프레시 토큰 디코딩 테스트
    try {
      const decoded = this.jwtService.decode(refreshToken);
      this.logger.log(`생성된 리프레시 토큰 디코딩: ${JSON.stringify(decoded)}`);

      // 만료시간 확인
      if (decoded && decoded['exp']) {
        const expiryDate = new Date(decoded['exp'] * 1000);
        this.logger.log(`리프레시 토큰 만료시간: ${expiryDate.toISOString()}`);
      }
    } catch (error) {
      this.logger.error(`생성된 토큰 디코딩 실패: ${error.message}`);
    }

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      role,
    };
  }
}
