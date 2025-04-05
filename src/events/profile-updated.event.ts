import { UserProfile } from "@/types/user";

/**
 * 사용자 프로필 업데이트 이벤트
 */
export class ProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly profile: UserProfile,
  ) {}
}
