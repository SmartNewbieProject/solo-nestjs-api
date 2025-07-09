import { relations } from 'drizzle-orm';
import { universityInfo } from '../university_info';
import { profiles } from '../profiles';
import { universities } from '../universities';
import { departments } from '../departments';

export const universityInfoRelations = relations(universityInfo, ({ one }) => ({
  profile: one(profiles),
  university: one(universities),
  department: one(departments),
}));
