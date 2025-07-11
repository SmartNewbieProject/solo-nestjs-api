import { Role } from "@/auth/domain/user-role.enum";
import { Gender } from "./enum";
/**
 * 인증된 사용자 정보를 나타내는 인터페이스
 * @CurrentUser 데코레이터를 통해 컨트롤러에서 접근 가능
 */
export interface AuthenticationUser {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  gender: Gender;
  role: Role;
}

