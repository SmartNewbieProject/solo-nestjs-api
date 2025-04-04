import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const userRangePreferences = pgTable('user_range_preferences', {
  id: uuid('id'),
  userPreferenceId: varchar('user_preference_id', { length: 36 }),
  preferenceTypeId: varchar('preference_type_id', { length: 36 }),
  minValue: integer('min_value'),
  maxValue: integer('max_value'),
  ...timestamps,
});
