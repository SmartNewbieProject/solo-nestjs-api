import {
  BadGatewayException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginRequest, TokenResponse } from '../dto';
import { PassLoginRequest, PassLoginResponse } from '../dto/pass-login.dto';
import { Role } from '../domain/user-role.enum';
import { AuthRepository } from '../repository/auth.repository';
import { Gender } from '@/types/enum';
import { IamportService } from './iamport.service';

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
    private readonly iamportService: IamportService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<TokenResponse> {
    const { email, password } = loginRequest;

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    const genderResult = await this.authRepository.findGenderByUserId(user.id);

    if (!genderResult) {
      throw new BadGatewayException('성별정보가 없습니다.');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email || '',
      user.name,
      user.role,
      genderResult.gender,
    );
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, role: user.role };
  }

  async passLogin(
    passLoginRequest: PassLoginRequest,
  ): Promise<PassLoginResponse> {
    const { impUid } = passLoginRequest;

    // PortOne V2에서 본인인증 정보 조회
    const certification = await this.iamportService.getCertification(impUid);
    const formattedPhoneNumber = this.formatPhoneNumber(certification.phone);

    // 전화번호로 기존 사용자 찾기
    const existingUser =
      await this.authRepository.findUserByPhoneNumber(formattedPhoneNumber);

    if (existingUser) {
      // 기존 사용자 로그인
      const genderResult = await this.authRepository.findGenderByUserId(
        existingUser.id,
      );

      if (!genderResult) {
        throw new BadGatewayException('성별정보가 없습니다.');
      }

      const tokens = await this.generateTokens(
        existingUser.id,
        existingUser.email || '',
        existingUser.name,
        existingUser.role,
        genderResult.gender,
      );

      await this.authRepository.saveRefreshToken(
        existingUser.id,
        tokens.refreshToken,
      );

      return {
        ...tokens,
        role: existingUser.role,
        isNewUser: false,
      };
    } else {
      // 신규 사용자 - 회원가입 필요
      return {
        accessToken: '',
        refreshToken: '',
        tokenType: 'Bearer',
        expiresIn: 0,
        role: '',
        isNewUser: true,
        certificationInfo: {
          name: certification.name,
          phone: formattedPhoneNumber,
          gender: certification.gender === 'MALE' ? 'MALE' : 'FEMALE',
          birthday: certification.birthday,
        },
      };
    }
  }

  async withdraw(userId: string, password: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await this.verifyPassword(password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // await this.authRepository.deleteUser(userId);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      this.logger.log(`리프레시 토큰 검증, 토큰 길이: ${refreshToken?.length}`);
      this.logger.log(
        `JWT_SECRET: ${this.configService.get<string>('JWT_SECRET')?.substring(0, 3)}...`,
      );

      // 토큰 디코딩 시도 (검증 없이)
      try {
        const decoded = this.jwtService.decode(refreshToken);
        this.logger.log(`토큰 디코딩 결과: ${JSON.stringify(decoded)}`);
      } catch (decodeError) {
        this.logger.error(`토큰 디코딩 실패: ${decodeError.message}`);
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      this.logger.log(`토큰 검증 성공, payload: ${JSON.stringify(payload)}`);

      const storedToken = await this.authRepository.findRefreshToken(
        payload.id,
        refreshToken,
      );
      if (!storedToken) {
        this.logger.log('저장된 리프레시토큰이 없음');
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const user = await this.authRepository.findUserById(payload.id);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const genderResult = await this.authRepository.findGenderByUserId(
        user.id,
      );

      if (!genderResult) {
        throw new BadGatewayException('성별정보가 없습니다.');
      }

      const tokens = await this.generateTokens(
        user.id,
        user.email || '',
        user.name,
        user.role,
        genderResult.gender,
      );
      await this.authRepository.updateRefreshToken(
        user.id,
        refreshToken,
        tokens.refreshToken,
      );

      return tokens;
    } catch (error) {
      this.logger.error('리프레시 토큰 검증 실패');
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

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 전화번호를 기존 형식(010-XXXX-XXXX)으로 변환합니다.
   * @param phoneNumber 하이픈이 없는 전화번호 (예: 01077241084)
   * @returns 하이픈이 포함된 전화번호 (예: 010-7724-1084)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // 하이픈 제거 후 숫자만 추출
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    // 010으로 시작하는 11자리 전화번호인지 확인
    if (cleanNumber.length === 11 && cleanNumber.startsWith('010')) {
      return `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3, 7)}-${cleanNumber.slice(7)}`;
    }

    // 형식이 맞지 않으면 원본 반환
    return phoneNumber;
  }

  private async generateTokens(
    userId: string,
    email: string,
    name: string,
    role: Role,
    gender: Gender,
  ): Promise<TokenResponse> {
    this.logger.log(
      `토큰 생성 시작 - userId: ${userId}, email: ${email}, name: ${name}, role: ${role}, gender: ${gender}`,
    );

    const accessToken = await this.jwtService.signAsync(
      { id: userId, email, name, role, gender },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { id: userId, email, role, gender },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '30d',
      },
    );

    try {
      const decoded = this.jwtService.decode(refreshToken);
      this.logger.log(
        `생성된 리프레시 토큰 디코딩: ${JSON.stringify(decoded)}`,
      );
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
