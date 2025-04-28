import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { timestamps, uuid } from "./helper";

export const articleCategory = pgTable('article_categories', {
  id: uuid(),
  emojiUrl: text('emoji_url').notNull(),
  name: varchar('name', { length: 20 }).notNull(),
  ...timestamps,
});
