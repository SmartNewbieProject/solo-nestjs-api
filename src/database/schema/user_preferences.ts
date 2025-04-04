import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { profiles } from './profiles';

export const userPreferences = pgTable('user_preferences', {
  id: uuid().primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => profiles.userId),
  distanceMax: varchar('distance_max', { length: 36 }),
  ...timestamps,
});
