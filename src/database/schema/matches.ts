import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export type MatchType = 'scheduled' | 'rematching' | 'admin';

export const matches = pgTable('matches', {
  id: uuid(),
  myId: varchar('my_id', { length: 128 })
    .references(() => users.id)
    .notNull(),
  matcherId: varchar('matcher_id', { length: 128 }).references(() => users.id),
  score: decimal('score', { precision: 8, scale: 2 }).notNull(),
  direct: boolean('direct').default(false),
  publishedAt: timestamp('published_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  expiredAt: timestamp('expired_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  type: varchar('type', { length: 30 }).notNull(),
  ...timestamps,
});
