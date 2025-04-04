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

export type Preference = {
  typeName: string;
  optionId: string;
  multiple: boolean;
  optionDisplayName: string;
  maximumChoiceCount: number;
}

export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}


export interface UniversityDetail {
  name: string;
  authentication: boolean;
  department: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  profileImages: ProfileImage[];
  universityDetails: UniversityDetail | null;
  preferences: PreferenceTypeGroup[];
}
