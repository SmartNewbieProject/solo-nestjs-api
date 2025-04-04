import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const preferenceTypes = pgTable('preference_types', {
  id: uuid('id'),
  code: varchar('code', { length: 50 }).unique(),
  name: varchar('name', { length: 100 }),
  multiSelect: boolean('multi_select').default(false),
  ...timestamps,
});
