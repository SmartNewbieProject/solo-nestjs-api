import { pgTable, varchar, text, integer, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const preferenceOptions = pgTable('preference_options', {
  id: uuid(),
  imageUrl: text('image_url'),
  preferenceTypeId: varchar('preference_type_id', { length: 128 }),
  value: varchar('value', { length: 100 }).notNull(),
  order: integer().notNull().default(0),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  deprecated: boolean().notNull().default(true),
  ...timestamps,
});
