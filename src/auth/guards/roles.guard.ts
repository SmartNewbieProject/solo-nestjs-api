import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../domain/user-role.enum';
import { ROLES_KEY } from '@auth/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    let requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getClass());
    }

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    // 사용자의 역할이 필요한 역할 중 하나와 일치하는지 확인
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return true;
  }
}
