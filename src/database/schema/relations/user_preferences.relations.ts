import { relations } from 'drizzle-orm';
import { userPreferences } from '../user_preferences';
import { profiles } from '../profiles';
import { userPreferenceOptions } from '../user_preference_options';
import { userRangePreferences } from '../user_range_preferences';

export const userPreferencesRelations = relations(userPreferences, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [userPreferences.userId],
    references: [profiles.userId],
  }),
  preferenceOptions: many(userPreferenceOptions),
  rangePreferences: many(userRangePreferences),
}));
