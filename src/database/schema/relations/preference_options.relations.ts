import { relations } from 'drizzle-orm';
import { preferenceOptions } from '../preference_options';
import { preferenceTypes } from '../preference_types';
import { userPreferenceOptions } from '../user_preference_options';

export const preferenceOptionsRelations = relations(preferenceOptions, ({ one, many }) => ({
  preferenceType: one(preferenceTypes, {
    fields: [preferenceOptions.preferenceTypeId],
    references: [preferenceTypes.id],
  }),
  userPreferenceOptions: many(userPreferenceOptions),
}));
