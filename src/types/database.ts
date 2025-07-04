import { InferSelectModel } from 'drizzle-orm';
import {
  users,
  profiles,
  preferenceTypes,
  preferenceOptions,
  payHistories,
  universityDetails,
  images,
  profileImages,
  userPreferences,
  matches,
  matchingRequests,
  reports,
  userPreferenceOptions,
  userRangePreferences,
  articles,
  comments,
  likes,
  tickets,
  smsAuthorization,
  articleCategory,
  hotArticles,
  withdrawalReasons,
} from '@/database/schema';

// 사용자 관련 모델
export type UserModel = InferSelectModel<typeof users>;
export type ProfileModel = InferSelectModel<typeof profiles>;
export type UniversityDetailModel = InferSelectModel<typeof universityDetails>;
export type ProfileImageModel = InferSelectModel<typeof profileImages>;

// 선호도 관련 모델
export type PreferenceTypeModel = InferSelectModel<typeof preferenceTypes>;
export type PreferenceOptionModel = InferSelectModel<typeof preferenceOptions>;
export type UserPreferenceModel = InferSelectModel<typeof userPreferences>;
export type UserPreferenceOptionModel = InferSelectModel<
  typeof userPreferenceOptions
>;
export type UserRangePreferenceModel = InferSelectModel<
  typeof userRangePreferences
>;

// 매칭 관련 모델
export type MatchModel = InferSelectModel<typeof matches>;
export type MatchingRequestModel = InferSelectModel<typeof matchingRequests>;

// 게시글 관련 모델
export type ArticleModel = InferSelectModel<typeof articles>;
export type CommentModel = InferSelectModel<typeof comments>;
export type LikeModel = InferSelectModel<typeof likes>;
export type ArticleCategoryModel = InferSelectModel<typeof articleCategory>;
export type HotArticleModel = InferSelectModel<typeof hotArticles>;
export type ReportModel = InferSelectModel<typeof reports>;

// 기타 모델
export type ImageModel = InferSelectModel<typeof images>;
export type PayHistoryModel = InferSelectModel<typeof payHistories>;
export type TicketModel = InferSelectModel<typeof tickets>;
export type SmsAuthorizationModel = InferSelectModel<typeof smsAuthorization>;
export type WithdrawalReasonModel = InferSelectModel<typeof withdrawalReasons>;
