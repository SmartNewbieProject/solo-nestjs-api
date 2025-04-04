import { Role } from "@/auth/domain/user-role.enum";

/**
 * 인증된 사용자 정보를 나타내는 인터페이스
 * @CurrentUser 데코레이터를 통해 컨트롤러에서 접근 가능
 */
export interface AuthenticationUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

