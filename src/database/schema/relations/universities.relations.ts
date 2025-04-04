import { relations } from 'drizzle-orm';
import { universities } from '../universities';
import { universityDetails } from '../university_details';

export const universitiesRelations = relations(universities, ({ many }) => ({
  universityDetails: many(universityDetails),
}));
