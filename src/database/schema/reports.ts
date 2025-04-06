import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';
import { articles } from './articles';

export const reports = pgTable('reports', {
  id: uuid(),
  postId: varchar('post_id', { length: 128 }).references(() => articles.id).notNull(),
  reporterId: varchar('reporter_id', { length: 128 }).references(() => users.id).notNull(),
  reportedId: varchar('reported_id', { length: 128 }).references(() => users.id).notNull(),
  reason: varchar('reason', { length: 255 }),
  status: varchar('status', { length: 15 }),
  ...timestamps,
});
