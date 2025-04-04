import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';

export const matches = pgTable('matches', {
  id: uuid('id'),
  error: varchar('error', { length: 255 }),
  maleUserId: varchar('male_user_id', { length: 128 }).references(() => users.id),
  femaleUserId: varchar('female_user_id', { length: 128 }).references(() => users.id),
  score: varchar('score', { length: 36 }),
  ...timestamps,
});
