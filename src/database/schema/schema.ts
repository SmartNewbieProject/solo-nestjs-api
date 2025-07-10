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
import { withdrawalReasons } from './withdrawal_reasons';
import { matchingFailureLogs } from './matching_failure_logs';
import { universities } from './universities';
import { departments } from './departments';
import { universityInfo } from './university_info';
import { versionUpdates } from './version_updates';

// 관계형 매핑 파일 가져오기
import './relations';

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
  withdrawalReasons,
  articleCategory,
  hotArticles,
  matchingFailureLogs,
  universities,
  departments,
  universityInfo,
  versionUpdates,
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
  withdrawalReasons,
  articleCategory,
  hotArticles,
  matchingFailureLogs,
  universities,
  departments,
  universityInfo,
  versionUpdates,
];
