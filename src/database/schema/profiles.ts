import { pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { users } from './users';
import { Gender } from '@/types/enum';

export enum UserRank {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  UNKNOWN = 'UNKNOWN',
}

export const profiles = pgTable('profiles', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull().unique(),
  age: integer('age').notNull(),
  gender: varchar('gender', { length: 10 }).$type<Gender>().notNull(),
  name: varchar('name', { length: 15 }).notNull(),
  title: varchar('title', { length: 100 }),
  instagramId: varchar('instagram_id', { length: 100 }),
  is_matching_enable: boolean('is_matching_enable').default(true).notNull(),
  introduction: varchar('introduction', { length: 255 }),
  statusAt: varchar('status_at', { length: 36 }),
  rank: varchar('rank', { length: 7, enum: ['S', 'A', 'B', 'C', 'UNNKOWN'] }).default('UNNKOWN'),
  universityDetailId: varchar('university_detail_id', { length: 36 }),
  ...timestamps,
});
