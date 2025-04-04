import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const userPreferences = pgTable('user_preferences', {
  id: uuid(),
  userId: varchar('user_id', { length: 36 }),
  distanceMax: varchar('distance_max', { length: 36 }),
  ...timestamps,
});
