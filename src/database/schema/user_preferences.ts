import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const userPreferences = pgTable('user_preferences', {
  id: uuid().primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id).unique().notNull(),
  distanceMax: varchar('distance_max', { length: 36 }),
  ...timestamps,
});
