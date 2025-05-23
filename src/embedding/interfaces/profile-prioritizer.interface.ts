import { UserProfile } from "@/types/user";

export interface ProfilePrioritizer {
  extract(profile: UserProfile): string;
}
