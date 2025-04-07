import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";
import { uuid, timestamps } from "./helper";
import { users } from "./users";
import { articles } from "./articles";

export const comments = pgTable('comments', {
  id: uuid(),
  authorId: varchar('author_id', { length: 36 }).references(() => users.id).notNull(),
  postId: varchar('post_id', { length: 36 }).references(() => articles.id).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 15 }).notNull(),
  emoji: varchar('emoji', { length: 10 }),
  ...timestamps,
});
