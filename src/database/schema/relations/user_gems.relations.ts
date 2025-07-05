import { relations } from 'drizzle-orm';
import { userGems } from '../user_gems';
import { users } from '../users';

export const userGemsRelations = relations(userGems, ({ one }) => ({
  user: one(users, {
    fields: [userGems.userId],
    references: [users.userId],
  }),
}));
