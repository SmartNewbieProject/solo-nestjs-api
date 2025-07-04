import { relations } from 'drizzle-orm';
import { userRangePreferences } from '../user_range_preferences';
import { userPreferences } from '../user_preferences';
import { preferenceTypes } from '../preference_types';

export const userRangePreferencesRelations = relations(
  userRangePreferences,
  ({ one }) => ({
    userPreference: one(userPreferences, {
      fields: [userRangePreferences.userPreferenceId],
      references: [userPreferences.id],
    }),
    preferenceType: one(preferenceTypes, {
      fields: [userRangePreferences.preferenceTypeId],
      references: [preferenceTypes.id],
    }),
  }),
);
