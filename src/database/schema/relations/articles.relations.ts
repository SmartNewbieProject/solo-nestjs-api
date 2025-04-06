import { relations } from 'drizzle-orm';
import { articles } from '../articles';
import { users } from '../users';
import { comments } from '../comments';

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));
