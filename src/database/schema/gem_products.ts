import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { timestamps, uuid } from './helper';

export const gemProducts = pgTable('gem_products', {
  id: uuid(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  gemAmount: integer('gem_amount').notNull(),
  bonusGems: integer('bonus_gems').notNull().default(0),
  totalGems: integer('total_gems').notNull(),
  price: integer('price').notNull(),
  discountRate: integer('discount_rate').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
});
