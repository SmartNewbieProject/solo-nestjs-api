import { relations } from 'drizzle-orm';
import { userPreferenceOptions } from '../user_preference_options';
import { userPreferences } from '../user_preferences';
import { preferenceOptions } from '../preference_options';

export const userPreferenceOptionsRelations = relations(
  userPreferenceOptions,
  ({ many, one }) => ({
    userPreference: many(userPreferences),
    preferenceOption: one(preferenceOptions, {
      fields: [userPreferenceOptions.preferenceOptionId],
      references: [preferenceOptions.id],
    }),
  }),
);
