import { pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { PreferenceTarget } from './enums';

export const preferenceTargetEnum = pgEnum('preference_target', [
  PreferenceTarget.SELF,
  PreferenceTarget.PARTNER,
]);

export const userPreferenceOptions = pgTable('user_preference_options', {
  id: uuid(),
  userPreferenceId: varchar('user_preference_id', { length: 36 }).notNull(),
  preferenceOptionId: varchar('preference_option_id', { length: 36 }).notNull(),
  preferenceTarget: preferenceTargetEnum('preference_target')
    .notNull()
    .default(PreferenceTarget.PARTNER),
  ...timestamps,
});
