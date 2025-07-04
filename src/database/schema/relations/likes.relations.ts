import { relations } from 'drizzle-orm';
import { likes } from '../likes';
import { articles } from '../articles';
import { users } from '../users';

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [likes.articleId],
    references: [articles.id],
  }),
}));
