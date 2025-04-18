import { pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const preferenceOptions = pgTable('preference_options', {
  id: uuid(),
  imageUrl: text('image_url'),
  preferenceTypeId: varchar('preference_type_id', { length: 128 }),
  value: varchar('value', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  ...timestamps,
});
