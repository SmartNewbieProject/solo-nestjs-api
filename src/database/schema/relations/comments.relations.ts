import { relations } from 'drizzle-orm';
import { comments } from '../comments';
import { users } from '../users';
import { articles } from '../articles';

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(articles, {
    fields: [comments.postId],
    references: [articles.id],
  }),
}));
