import { relations } from 'drizzle-orm';
import { universityInfo } from '../university_info';
import { profiles } from '../profiles';
import { universities } from '../universities';
import { departments } from '../departments';

export const universityInfoRelations = relations(universityInfo, ({ one }) => ({
  profile: one(profiles, {
    fields: [universityInfo.profileId],
    references: [profiles.id],
  }),
  university: one(universities, {
    fields: [universityInfo.universityId],
    references: [universities.id],
  }),
  department: one(departments, {
    fields: [universityInfo.departmentId],
    references: [departments.id],
  }),
}));