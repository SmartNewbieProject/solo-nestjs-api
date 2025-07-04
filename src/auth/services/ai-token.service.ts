import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../domain/user-role.enum';
import { Gender } from '@/types/enum';

@Injectable()
export class AiTokenService {
  private readonly logger = new Logger(AiTokenService.name);
  private readonly AI_USER_ID = 'ai-bot-user-id-permanent';
  private readonly AI_USER_EMAIL = 'ai-bot@sometimes.com';
  private readonly AI_USER_NAME = 'AI Bot';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * AI 서버용 영구 토큰 생성
   * 만료 시간이 매우 긴 토큰을 생성합니다 (10년)
   */
  async generatePermanentAiToken(): Promise<string> {
    const payload = {
      id: this.AI_USER_ID,
      email: this.AI_USER_EMAIL,
      name: this.AI_USER_NAME,
      role: Role.USER, // AI 봇도 USER 역할 사용
      gender: Gender.MALE, // AI는 성별이 없지만 시스템상 필요
      type: 'permanent_ai_token',
      iat: Math.floor(Date.now() / 1000),
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '10y', // 10년 만료
    });

    this.logger.log('AI 서버용 영구 토큰이 생성되었습니다.');
    return token;
  }

  /**
   * AI 토큰 검증
   */
  async verifyAiToken(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return (
        payload.role === Role.USER && payload.type === 'permanent_ai_token'
      );
    } catch (error) {
      this.logger.error('AI 토큰 검증 실패:', error);
      return false;
    }
  }

  /**
   * AI 사용자 정보 반환
   */
  getAiUserInfo() {
    return {
      id: this.AI_USER_ID,
      email: this.AI_USER_EMAIL,
      name: this.AI_USER_NAME,
      role: Role.USER,
      gender: Gender.MALE,
    };
  }
}
