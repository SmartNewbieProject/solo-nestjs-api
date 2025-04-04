import { relations } from 'drizzle-orm';
import { users } from '../users';
import { profiles } from '../profiles';
import { payHistories } from '../pay_histories';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.profileId],
    references: [profiles.id],
  }),
  payHistories: many(payHistories),
}));
