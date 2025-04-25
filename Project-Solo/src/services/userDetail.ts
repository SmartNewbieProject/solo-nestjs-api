import axios from 'axios';
import { axiosHandler } from '@/common/helper/axios';
import { Gender } from '@/types/enum';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8044/api';

/**
 * 계정 상태 enum
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * 프로필 이미지 인터페이스
 */
export interface ProfileImage {
  id: string;
  order: number;
  isMain: boolean;
  url: string;
}

/**
 * 대학교 정보 인터페이스
 */
export interface UniversityDetail {
  name: string;
  authentication: boolean;
  department: string;
  grade: string;
  studentNumber: string;
}

/**
 * 선호도 옵션 인터페이스
 */
export interface PreferenceOption {
  id: string;
  displayName: string;
}

/**
 * 선호도 타입 그룹 인터페이스
 */
export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}

/**
 * 유저 상세 정보 응답 인터페이스
 */
export interface UserDetailResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  gender: Gender;
  accountStatus: AccountStatus;
  profileImages: ProfileImage[];
  instagramId: string | null;
  universityDetails: UniversityDetail | null;
  preferences: PreferenceTypeGroup[];
  createdAt: Date;
  lastActiveAt: Date | null;
  // 추가 정보
  role: string;
  title: string | null;
  introduction: string | null;
  appearanceRank: string | null;
  oauthProvider: string | null;
  deletedAt: Date | null;
}

/**
 * 계정 상태 변경 요청 인터페이스
 */
export interface UpdateAccountStatusRequest {
  userId: string;
  status: AccountStatus;
  reason?: string;
}

/**
 * 경고 메시지 발송 요청 인터페이스
 */
export interface SendWarningMessageRequest {
  userId: string;
  title: string;
  content: string;
}

/**
 * 강제 로그아웃 요청 인터페이스
 */
export interface ForceLogoutRequest {
  userId: string;
  reason?: string;
}

/**
 * 프로필 수정 요청 발송 인터페이스
 */
export interface SendProfileUpdateRequestRequest {
  userId: string;
  title: string;
  content: string;
}

/**
 * 유저 프로필 직접 수정 요청 인터페이스
 */
export interface UpdateUserProfileRequest {
  userId: string;
  name?: string;
  instagramId?: string | null;
  reason?: string;
}

/**
 * 기본 응답 인터페이스
 */
export interface BasicResponse {
  success: boolean;
  message: string;
}

/**
 * 유저 상세 정보 관리 서비스
 */
export const UserDetailService = {
  /**
   * 유저 상세 정보 조회
   */
  getUserDetail: async (userId: string): Promise<UserDetailResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/users/detail/${userId}`);
      return response.data;
    });
  },

  /**
   * 계정 상태 변경
   */
  updateAccountStatus: async (request: UpdateAccountStatusRequest): Promise<BasicResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/users/detail/status`, request);
      return response.data;
    });
  },

  /**
   * 경고 메시지 발송
   */
  sendWarningMessage: async (request: SendWarningMessageRequest): Promise<BasicResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/users/detail/warning`, request);
      return response.data;
    });
  },

  /**
   * 강제 로그아웃
   */
  forceLogout: async (request: ForceLogoutRequest): Promise<BasicResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/users/detail/logout`, request);
      return response.data;
    });
  },

  /**
   * 프로필 수정 요청 발송
   */
  sendProfileUpdateRequest: async (request: SendProfileUpdateRequestRequest): Promise<BasicResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/users/detail/profile-update-request`, request);
      return response.data;
    });
  },

  /**
   * 유저 프로필 직접 수정
   */
  updateUserProfile: async (request: UpdateUserProfileRequest): Promise<BasicResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/users/detail/profile`, request);
      return response.data;
    });
  },
};
