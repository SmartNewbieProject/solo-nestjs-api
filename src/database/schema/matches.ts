import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const matches = pgTable('matches', {
  id: uuid(),
  myId: varchar('my_id', { length: 128 }).references(() => users.id),
  matcherId: varchar('matcher_id', { length: 128 }).references(() => users.id),
  score: varchar('score', { length: 36 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  ...timestamps,
});
