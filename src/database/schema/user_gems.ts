import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { timestamps } from './helper';
import { users } from './users';

export const userGems = pgTable('user_gems', {
  userId: varchar('user_id', { length: 128 })
    .references(() => users.id)
    .primaryKey(),
  gemBalance: integer('gem_balance').notNull().default(0),
  totalCharged: integer('total_charged').notNull().default(0),
  totalConsumed: integer('total_consumed').notNull().default(0),
  lastTransactionAt: timestamp('last_transaction_at', {
    mode: 'date',
    withTimezone: true,
  }),
  ...timestamps,
});
