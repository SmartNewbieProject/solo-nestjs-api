import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const payHistories = pgTable('pay_histories', {
  id: uuid('id'),
  amount: integer('amount'),
  userId: varchar('user_id', { length: 128 }),
  method: varchar('method', { length: 50 }),
  paidAt: timestamps.createdAt,
  ...timestamps,
});
