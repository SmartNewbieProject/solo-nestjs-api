import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../domain/user-role.enum';
import { ROLES_KEY } from '@auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 메서드에 필요한 역할 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 역할이 지정되지 않은 경우 접근 허용
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // 사용자 정보가 없는 경우
    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }
    
    // 사용자의 역할이 필요한 역할 중 하나와 일치하는지 확인
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    
    return true;
  }
}
