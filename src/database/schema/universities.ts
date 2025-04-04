import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const universities = pgTable('universities', {
  id: uuid('id'),
  name: varchar('name', { length: 30 }),
  ...timestamps,
});
