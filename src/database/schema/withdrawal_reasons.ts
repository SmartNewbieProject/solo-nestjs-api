import { pgTable, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

// 탈퇴 사유 열거형
export const withdrawalReasonEnum = pgEnum('withdrawal_reason_type', [
  'FOUND_PARTNER',
  'POOR_MATCHING',
  'PRIVACY_CONCERN',
  'SAFETY_CONCERN',
  'TECHNICAL_ISSUES',
  'INACTIVE_USAGE',
  'DISSATISFIED_SERVICE',
  'OTHER'
]);

// 탈퇴 사유 테이블
export const withdrawalReasons = pgTable('withdrawal_reasons', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }).notNull(),
  reason: withdrawalReasonEnum('reason').notNull(),
  detail: text('detail'),
  withdrawnAt: timestamp('withdrawn_at').notNull(),
  serviceDurationDays: integer('service_duration_days').notNull(),
  ...timestamps,
});
