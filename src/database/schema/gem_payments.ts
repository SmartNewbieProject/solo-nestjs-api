import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { timestamps, uuid } from './helper';
import { users } from './users';
import { gemProducts } from './gem_products';

export const paymentMethodEnum = pgEnum('payment_method', [
  'CARD',
  'SIMPLE_PAY',
  'PHONE',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]);

export const gemPayments = pgTable('gem_payments', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 })
    .references(() => users.id)
    .notNull(),
  productId: varchar('product_id', { length: 128 })
    .references(() => gemProducts.id)
    .notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentAmount: integer('payment_amount').notNull(),
  paymentStatus: paymentStatusEnum('payment_status')
    .notNull()
    .default('PENDING'),
  pgTransactionId: varchar('pg_transaction_id', { length: 255 }),
  receiptUrl: text('receipt_url'),
  paidAt: timestamp('paid_at', { mode: 'date', withTimezone: true }),
  ...timestamps,
});
