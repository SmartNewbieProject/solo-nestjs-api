import { relations } from 'drizzle-orm';
import { profiles } from '../profiles';
import { users } from '../users';
import { universityDetails } from '../university_details';
import { profileImages } from '../profile_images';
import { userPreferences } from '../user_preferences';
import { matchingRequests } from '../matching_requests';
import { universityInfo } from '../university_info';

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users),
  universityDetail: one(universityDetails),
  profileImages: many(profileImages),
  userPreference: one(userPreferences),
  matchingRequests: many(matchingRequests),
  universityInfo: one(universityInfo),
}));
