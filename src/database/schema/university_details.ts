import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const universityDetails = pgTable('university_details', {
  id: uuid().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id),
  universityName: varchar('university_name', { length: 30 }).notNull(),
  department: varchar('department', { length: 30 }).notNull(),
  authentication: boolean('authentication').default(false).notNull(),
  grade: varchar('grade', { length: 10 }).notNull(),
  studentNumber: varchar('student_number', { length: 10 }).notNull(),
  ...timestamps,
});
