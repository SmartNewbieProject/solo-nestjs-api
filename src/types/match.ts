import { Gender } from "./enum";
import { PreferenceTypeGroup } from "./user";

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


export type Similarity = {
  userId: string;
  similarity: number;
};

export type UnmatchedUser = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
}

export type PartnerDetails = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  instagramId: string;
  university: {
    department: string;
    name: string;
    grade: string;
    studentNumber: string;
  } | null;
  preferences: PreferenceTypeGroup[];
}

export enum TicketStatus {
  AVAILABLE = 'available',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum TicketType {
  REMATCHING = 'rematching',
}
export type TicketSummary = {
  id: string;
  status: TicketStatus;
  name: string;
  type: TicketType;
  expiredAt: Date | null;
  createdAt: Date;
}

export enum MatchType {
  SCHEDULED = 'scheduled',
  REMATCHING = 'rematching',
  ADMIN = 'admin',
}

export type MatchViewType = 'open' | 'waiting' | 'not-found';

export type MatchDetails = {
  type: MatchViewType;
  endOfView: Date | null;
  partner: PartnerDetails | null;
};
 