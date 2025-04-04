import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const universityDetails = pgTable('university_details', {
  id: uuid().primaryKey(),
  universityId: varchar('university_id', { length: 36 }).notNull().unique(),
  authentication: boolean('authentication').default(false).notNull(),
  ...timestamps,
});
  