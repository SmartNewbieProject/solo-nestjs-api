import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { universities } from './universities';

export const departments = pgTable('departments', {
  id: uuid(),
  universityId: varchar('university_id', { length: 128 })
    .references(() => universities.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});
