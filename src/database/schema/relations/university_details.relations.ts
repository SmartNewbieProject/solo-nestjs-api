import { relations } from 'drizzle-orm';
import { universityDetails } from '../university_details';
import { universities } from '../universities';
import { profiles } from '../profiles';

export const universityDetailsRelations = relations(universityDetails, ({ one, many }) => ({
  university: one(universities, {
    fields: [universityDetails.universityId],
    references: [universities.id],
  }),
  
  profiles: many(profiles),
}));
