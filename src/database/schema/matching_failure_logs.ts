import { pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const matchingFailureLogs = pgTable('matching_failure_logs', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  reason: text('reason').notNull(),
  ...timestamps,
});
