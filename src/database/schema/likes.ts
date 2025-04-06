import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';
import { articles } from './articles';

export const likes = pgTable('likes', {
  id: uuid().primaryKey().notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  articleId: varchar('article_id', { length: 128 }).references(() => articles.id).notNull(),
  ...timestamps,
});
