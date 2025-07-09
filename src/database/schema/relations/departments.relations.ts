import { relations } from 'drizzle-orm';
import { departments } from '../departments';
import { universities } from '../universities';
import { universityInfo } from '../university_info';

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  university: one(universities, {
    fields: [departments.universityId],
    references: [universities.id],
  }),
  universityInfo: many(universityInfo),
}));