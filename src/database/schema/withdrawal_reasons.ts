import { pgTable, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export enum WithdrawalReason {
  FOUND_PARTNER = 'FOUND_PARTNER',
  POOR_MATCHING = 'POOR_MATCHING',
  PRIVACY_CONCERN = 'PRIVACY_CONCERN',
  SAFETY_CONCERN = 'SAFETY_CONCERN',
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
  INACTIVE_USAGE = 'INACTIVE_USAGE',
  DISSATISFIED_SERVICE = 'DISSATISFIED_SERVICE',
  OTHER = 'OTHER'
}

export const withdrawalReasons = pgTable('withdrawal_reasons', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  reason: varchar('reason').notNull(),
  detail: text('detail'),
  withdrawnAt: timestamp('withdrawn_at').notNull(),
  serviceDurationDays: integer('service_duration_days').notNull(),
  ...timestamps,
});
