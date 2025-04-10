import { pgTable, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const payHistories = pgTable('pay_histories', {
  id: uuid(),
  amount: integer('amount').notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  method: varchar('method', { length: 50 }),
  orderId: varchar('order_id', { length: 128 }),
  orderName: varchar('order_name', { length: 30 }).notNull(),
  txId: varchar('tx_id'),
  paymentKey: varchar('payment_key', { length: 128 }),
  receiptUrl: text('receipt_url'),
  paidAt: timestamp('paid_at'),
  ...timestamps,
});
