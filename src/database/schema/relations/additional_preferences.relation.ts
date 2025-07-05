import { relations } from 'drizzle-orm';
import { additionalPreferences } from '../addtional_preferences';
import { profiles } from '../profiles';

export const additionalPreferencesRelations = relations(
  additionalPreferences,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [additionalPreferences.profileId],
      references: [profiles.id],
    }),
  }),
);
