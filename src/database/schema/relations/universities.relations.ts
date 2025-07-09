import { relations } from 'drizzle-orm';
import { universities } from '../universities';
import { departments } from '../departments';
import { universityInfo } from '../university_info';

export const universitiesRelations = relations(universities, ({ many }) => ({
  departments: many(departments),
  universityInfo: many(universityInfo),
}));