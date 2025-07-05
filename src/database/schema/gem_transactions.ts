import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { uuid } from './helper';
import { users } from './users';

export const gemTransactionTypeEnum = pgEnum('gem_transaction_type', [
  'CHARGE',
  'CONSUME',
]);

export const gemReferenceTypeEnum = pgEnum('gem_reference_type', [
  'PAYMENT',
  'PROFILE_OPEN',
  'LIKE_MESSAGE',
  'CHAT',
  'FILTER',
]);

export const gemTransactions = pgTable('gem_transactions', {
  transactionId: uuid(),
  userId: varchar('user_id', { length: 128 })
    .references(() => users.id)
    .notNull(),
  transactionType: gemTransactionTypeEnum('transaction_type').notNull(),
  gemAmount: integer('gem_amount').notNull(),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  referenceType: gemReferenceTypeEnum('reference_type').notNull(),
  referenceId: varchar('reference_id', { length: 128 }),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});
