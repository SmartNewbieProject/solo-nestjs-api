import { pgTable, varchar, timestamp, pgEnum, integer, decimal } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

const matchTypeEnum = pgEnum('type', ['scheduled', 'rematching', 'admin']);
export type MatchType = 'scheduled' | 'rematching' | 'admin';

export const matches = pgTable('matches', {
  id: uuid(),
  myId: varchar('my_id', { length: 128 }).references(() => users.id),
  matcherId: varchar('matcher_id', { length: 128 }).references(() => users.id),
  score: decimal('score', { precision: 8, scale: 2 }).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  type: varchar('type', { length: 30 }).notNull(),
  ...timestamps,
});
