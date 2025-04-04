import { relations } from 'drizzle-orm';
import { preferenceTypes } from '../preference_types';
import { preferenceOptions } from '../preference_options';
import { userRangePreferences } from '../user_range_preferences';

export const preferenceTypesRelations = relations(preferenceTypes, ({ many }) => ({
  options: many(preferenceOptions),
  userRangePreferences: many(userRangePreferences),
}));
