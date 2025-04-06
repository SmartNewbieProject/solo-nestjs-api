import { relations } from 'drizzle-orm';
import { matches } from '../matches';
import { profiles } from '../profiles';

export const matchesRelations = relations(matches, ({ one }) => ({
  user: one(profiles, {
    fields: [matches.myId],
    references: [profiles.userId],
    relationName: 'maleMatches',
  }),
  
  matcher: one(profiles, {
    fields: [matches.matcherId],
    references: [profiles.userId],
    relationName: 'femaleMatches',
  }),
}));
