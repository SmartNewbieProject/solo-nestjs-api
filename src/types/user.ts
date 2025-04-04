import { Gender } from "./enum";

export interface ProfileDetails {
  id: string;
  userId: string;
  age: number;
  gender: Gender;
  name: string;
  title: string | null;
  introduction: string | null;
  statusAt: string | null;
  universityDetailId: string | null;
}
