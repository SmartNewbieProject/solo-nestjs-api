import { relations } from 'drizzle-orm';
import { gemTransactions } from '../gem_transactions';
import { users } from '../users';

export const gemTransactionsRelations = relations(
  gemTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [gemTransactions.userId],
      references: [users.userId],
    }),
  }),
);
