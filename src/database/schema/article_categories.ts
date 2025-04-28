import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { timestamps, uuid } from "./helper";

export const articleCategory = pgTable('article_categories', {
  id: uuid(),
  emojiUrl: text('emoji_url').notNull(),
  displayName: varchar('display_name', { length: 20 }).notNull(),
  code: varchar('code', { length: 15 }).notNull(),
  ...timestamps,
});
