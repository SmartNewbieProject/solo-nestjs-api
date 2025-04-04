import { relations } from 'drizzle-orm';
import { matches } from '../matches';
import { profiles } from '../profiles';

export const matchesRelations = relations(matches, ({ one }) => ({
  // 매치는 하나의 남성 프로필을 참조함
  maleUser: one(profiles, {
    fields: [matches.maleUserId],
    references: [profiles.userId],
    relationName: 'maleMatches',
  }),
  
  // 매치는 하나의 여성 프로필을 참조함
  femaleUser: one(profiles, {
    fields: [matches.femaleUserId],
    references: [profiles.userId],
    relationName: 'femaleMatches',
  }),
}));
