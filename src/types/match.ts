import { Gender } from "./enum";

export type UserPreferenceSummary = {
  id: string;
  name: string;
  age: number;
  mbti: string | undefined;
  interests: string[];
  personalities: string[];
  lifestyles: string[];
  tattoo: string | undefined;
  drinking: string | undefined;
  smoking: string | undefined;
}

export type UserVectorPayload = {
  userId: string;
  profileSummary: {
    name: string;
    age: number;
    gender: Gender;
    preferences: {
      typeName: string;
      options: string[]; // Example) "거의 안 마셨으면 좋겠음, 자주 마셔도 괜찮음"
    }[];
  }
}
