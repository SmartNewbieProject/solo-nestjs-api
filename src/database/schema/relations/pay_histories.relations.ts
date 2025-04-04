import { relations } from 'drizzle-orm';
import { payHistories } from '../pay_histories';
import { users } from '../users';

export const payHistoriesRelations = relations(payHistories, ({ many }) => ({
  user: many(users),
}));
