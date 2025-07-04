import { UserRank } from '@/database/schema/profiles';
import { Gender } from './enum';

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

export type ProfileSummary = Omit<
  ProfileDetails,
  'userId' | 'universityDetailId' | 'statusAt'
>;

export interface ProfileImage {
  id: string;
  order: number;
  isMain: boolean;
  url: string;
}

export interface PreferenceOption {
  id: string;
  displayName: string;
}

export interface ProfileRawDetails {
  id: string;
  name: string;
  updatedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
  userId: string;
  age: number;
  mbti: string | null;
  rank: UserRank;
  gender: Gender;
  instagramId: string | null;
  title: string | null;
  universityDetail: {
    name: string;
    authentication: boolean;
    department: string;
    grade: string;
    studentNumber: string;
  } | null;
  profileImages: ProfileImage[];
}

export type Preference = {
  typeName: string;
  optionId: string;
  multiple: boolean;
  optionDisplayName: string;
  maximumChoiceCount: number;
};

export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}

export interface PreferenceList extends PreferenceTypeGroup {
  multiple: boolean;
  maximumChoiceCount: number;
}

export interface UniversityDetail {
  name: string;
  authentication: boolean;
  department: string;
  grade: string;
  studentNumber: string;
}

export interface UserProfile {
  id: string;
  name: string;
  mbti: string | null;
  age: number;
  gender: Gender;
  rank: UserRank | null;
  profileImages: ProfileImage[];
  instagramId: string | null;
  universityDetails: UniversityDetail | null;
  preferences: PreferenceTypeGroup[];
  characteristics: PreferenceTypeGroup[];
}

export type CommonProfile = Omit<UserProfile, 'rank'>;

export interface UserDetails {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  email: string;
  profileImages: ProfileImage[];
  phoneNumber: string;
  instagramId: string | null;
  universityDetails: UniversityDetail | null;
}

export interface MbtiPreferences {
  goodMbti: string;
  badMbti: string;
}
