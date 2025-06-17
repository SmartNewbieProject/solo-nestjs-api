import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator';
import { AuthRepository } from '@auth/repository/auth.repository';
import { Role } from '@auth/domain/user-role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly authRepository: AuthRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        try {
          const payload = this.jwtService.verify(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
            ignoreExpiration: false,
          });
          request.user = payload;
        } catch (error) {
          this.logger.debug('Token verification failed for public route:', error);
        }
      }
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration: false,
      });

      // AI 봇 토큰인 경우 데이터베이스 확인 생략
      if (payload.type === 'permanent_ai_token') {
        this.logger.debug('AI 봇 토큰 인증 성공');
        request.user = payload;
        return true;
      }

      // 일반 사용자의 경우 실시간으로 사용자 상태 확인
      const user = await this.authRepository.findUserById(payload.id);
      if (!user) {
        this.logger.warn(`User ${payload.id} not found or inactive`);
        throw new UnauthorizedException('계정이 비활성화되었거나 삭제되었습니다.');
      }

      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
