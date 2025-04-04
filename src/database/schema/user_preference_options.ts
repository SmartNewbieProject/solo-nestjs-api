import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const userPreferenceOptions = pgTable('user_preference_options', {
  id: uuid('id'),
  userPreferenceId: varchar('user_preference_id', { length: 36 }),
  preferenceOptionId: varchar('preference_option_id', { length: 36 }),
  ...timestamps,
});
