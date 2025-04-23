import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const userActivities = pgTable('user_activities', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  activityAt: timestamp('activity_at').defaultNow().notNull(),
  ...timestamps,
});
