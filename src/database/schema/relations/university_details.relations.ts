import { relations } from 'drizzle-orm';
import { universityDetails } from '../university_details';
import { profiles } from '../profiles';

export const universityDetailsRelations = relations(universityDetails, ({ one, many }) => ({
  profiles: many(profiles),
}));
