import { relations } from 'drizzle-orm';
import { matchingFailureLogs } from '../matching_failure_logs';
import { users } from '../users';

export const matchingFailureLogsRelations = relations(matchingFailureLogs, ({ one }) => ({
  user: one(users, {
    fields: [matchingFailureLogs.userId],
    references: [users.id],
  }),
}));
