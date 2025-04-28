import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { articles } from './articles';

export const hotArticles = pgTable('hot_articles', {
  id: uuid().primaryKey().notNull(),
  articleId: varchar('article_id', { length: 128 }).references(() => articles.id).notNull(),
  curatorComment: varchar('curator_comment', { length: 255 }),
  ...timestamps,
});
