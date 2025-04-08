import { pgTable, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const payHistories = pgTable('pay_histories', {
  id: uuid(),
  amount: integer('amount').notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  method: varchar('method', { length: 50 }),
  orderId: varchar('order_id', { length: 128 }),
  orderName: varchar('order_name', { length: 30 }).notNull(),
  paymentKey: varchar('payment_key', { length: 128 }),
  paidAt: timestamp('paid_at'),
  ...timestamps,
});
