import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const users = pgTable('users', {
  id: uuid('id'),
  name: varchar('name', { length: 15 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  profileId: varchar('profile_id', { length: 36 }),
  oauthProvider: varchar('oauth_provider', { length: 30 }),
  ...timestamps,
});