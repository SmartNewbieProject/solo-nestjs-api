import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { uuid, timestamps } from "./helper";
import { users } from "./users";
import { articles } from "./articles";

export const comments = pgTable('comments', {
  id: uuid(),
  authorId: varchar('author_id', { length: 36 }).references(() => users.id).notNull(),
  articleId: varchar('article_id', { length: 36 }).references(() => articles.id).notNull(),
  parentId: varchar('parent_id', { length: 36 }).references(() => comments.id),
  content: varchar('content', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 15 }).notNull(),
  blindedAt: timestamp('blinded_at'),
  ...timestamps,
});
