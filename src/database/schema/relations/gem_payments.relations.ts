import { relations } from 'drizzle-orm';
import { gemPayments } from '../gem_payments';
import { users } from '../users';
import { gemProducts } from '../gem_products';

export const gemPaymentsRelations = relations(gemPayments, ({ one }) => ({
  user: one(users, {
    fields: [gemPayments.userId],
    references: [users.id],
  }),
  product: one(gemProducts, {
    fields: [gemPayments.productId],
    references: [gemProducts.id],
  }),
}));
