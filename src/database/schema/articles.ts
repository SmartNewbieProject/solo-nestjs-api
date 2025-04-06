import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { uuid, timestamps } from "./helper";
import { users } from "./users";

export const articles = pgTable('articles', {
  id: uuid(),
  authorId: varchar('author_id', { length: 128 }).references(() => users.id).notNull(),
  content: varchar('content', { length: 255 }).notNull(),
  anonymous: varchar('anonymous', { length: 15 }),
  emoji: varchar('emoji', { length: 10 }),
  likeCount: integer('like_count').notNull().default(0),
  blindedAt: timestamp('blinded_at'),
  ...timestamps,
});
