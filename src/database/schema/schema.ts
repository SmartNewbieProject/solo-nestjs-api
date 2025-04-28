// 모든 스키마 파일을 통합하는 파일
import { users } from './users';
import { profiles } from './profiles';
import { preferenceTypes } from './preference_types';
import { preferenceOptions } from './preference_options';
import { payHistories } from './pay_histories';
import { universityDetails } from './university_details';
import { images } from './images';
import { profileImages } from './profile_images';
import { userPreferences } from './user_preferences';
import { matches } from './matches';
import { matchingRequests } from './matching_requests';
import { reports } from './reports';
import { userPreferenceOptions } from './user_preference_options';
import { userRangePreferences } from './user_range_preferences';
import { articles } from './articles';
import { comments } from './comments';
import { likes } from './likes';
import { tickets } from './ticket';
import { smsAuthorization } from './sms_authorization';
import { articleCategory } from './article_categories';
import { hotArticles } from './hot_articles';

// 관계형 매핑 파일 가져오기
import './relations';

// enum 타입 내보내기
export * from './enums';

// 관계형 매핑 내보내기
export * from './relations';

// 모든 테이블 스키마 내보내기
export {
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
  tickets,
  likes,
  smsAuthorization,
  articleCategory,
  hotArticles,
};

// 모든 테이블 스키마를 배열로 내보내기
export const schemas = [
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
  articleCategory,
  hotArticles,
];
