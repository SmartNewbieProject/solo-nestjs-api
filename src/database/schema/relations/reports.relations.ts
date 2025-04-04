import { relations } from 'drizzle-orm';
import { reports } from '../reports';
import { profiles } from '../profiles';

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(profiles, {
    fields: [reports.reporterId],
    references: [profiles.userId],
    relationName: 'reportsMade',
  }),
  
  reported: one(profiles, {
    fields: [reports.reportedId],
    references: [profiles.userId],
    relationName: 'reportsReceived',
  }),
}));
