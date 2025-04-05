import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const universityDetails = pgTable('university_details', {
  id: uuid().primaryKey(),
  universityName: varchar('university_name', { length: 30 }).notNull(),
  department: varchar('department', { length: 30 }).notNull(),
  authentication: boolean('authentication').default(false).notNull(),
  ...timestamps,
});
