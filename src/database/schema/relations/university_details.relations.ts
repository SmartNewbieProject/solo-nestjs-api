import { relations } from 'drizzle-orm';
import { universityDetails } from '../university_details';
import { users } from '../users';

export const universityDetailsRelations = relations(
  universityDetails,
  ({ one }) => ({
    user: one(users, {
      fields: [universityDetails.userId],
      references: [users.id],
    }),
  }),
);
