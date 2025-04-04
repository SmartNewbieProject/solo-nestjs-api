import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const universityDetails = pgTable('university_details', {
  id: uuid(),
  universityId: varchar('university_id', { length: 36 }),
  authentication: boolean('authentication').default(false),
  ...timestamps,
});
  