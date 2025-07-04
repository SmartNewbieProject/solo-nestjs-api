import type { Dayjs } from 'dayjs';
import { Gender } from './enum';
import { PreferenceTypeGroup, UserProfile } from './user';
import { ElasticDate } from './common';

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
};

export type UserVectorPayload = {
  userId: string;
  profileSummary: {
    name: string;
    age: number;
    gender: Gender;
    rank: string | null;
    mbti: string | null;
    preferences: {
      typeName: string;
      options: string[]; // Example) "거의 안 마셨으면 좋겠음, 자주 마셔도 괜찮음"
    }[];
  };
};

export type Similarity = {
  userId: string;
  similarity: number;
};

export type WeightedPartner = Similarity & {
  matchCount: number;
  diversityScore: number;
  finalWeight: number;
};

export type UnmatchedUser = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
};

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
};

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
};

export enum MatchType {
  SCHEDULED = 'scheduled',
  REMATCHING = 'rematching',
  ADMIN = 'admin',
}

export type MatchViewType = 'open' | 'waiting' | 'not-found' | 'rematching';

export type MatchDetails = {
  id: string | null;
  type: MatchViewType;
  endOfView: ElasticDate;
  partner: UserProfile | null;
  untilNext: ElasticDate;
};

export type RawMatch = {
  type: string;
  id: string;
  updatedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
  myId: string;
  matcherId: string | null;
  score: string;
  direct: boolean | null;
  publishedAt: Date;
  expiredAt: Date;
};
