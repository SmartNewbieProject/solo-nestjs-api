import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { timestamps, uuid } from '@database/schema/helper';
import { profiles } from './profiles';

export const additionalPreferences = pgTable('additional_preferences', {
  id: uuid(),
  goodMbti: varchar('good_mbti', { length: 4 }),
  badMbti: varchar('bad_mbti', { length: 4 }),
  profileId: varchar('profile_id')
    .references(() => profiles.id)
    .notNull()
    .unique(),
  ...timestamps,
});
