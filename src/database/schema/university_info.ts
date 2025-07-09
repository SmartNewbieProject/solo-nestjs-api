import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { profiles } from './profiles';
import { universities } from './universities';
import { departments } from './departments';

export const universityInfo = pgTable('university_info', {
  id: uuid(),
  profileId: varchar('profile_id', { length: 128 })
    .references(() => profiles.id)
    .notNull(),
  universityId: varchar('university_id', { length: 128 })
    .references(() => universities.id)
    .notNull(),
  departmentId: varchar('department_id', { length: 128 })
    .references(() => departments.id)
    .notNull(),
  grade: varchar('grade', { length: 10 }).notNull(),
  studentNumber: varchar('student_number', { length: 10 }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  ...timestamps,
});
