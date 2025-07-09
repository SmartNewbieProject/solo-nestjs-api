import { relations } from 'drizzle-orm';
import { profiles } from '../profiles';
import { users } from '../users';
import { universityDetails } from '../university_details';
import { profileImages } from '../profile_images';
import { userPreferences } from '../user_preferences';
import { matchingRequests } from '../matching_requests';
import { matches } from '../matches';
import { universityInfo } from '../university_info';

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  universityDetail: one(universityDetails, {
    fields: [profiles.universityDetailId],
    references: [universityDetails.id],
  }),
  profileImages: many(profileImages),
  userPreference: one(userPreferences),
  matchingRequests: many(matchingRequests),
  universityInfo: many(universityInfo),
}));
