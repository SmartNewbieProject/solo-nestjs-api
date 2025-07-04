import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { Role } from '@/auth/domain/user-role.enum';

export const users = pgTable('users', {
  id: uuid(),
  name: varchar('name', { length: 15 }).notNull(),
  email: varchar('email', { length: 100 }),
  password: varchar('password', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 16 }).notNull(),
  birthday: varchar('birthday', { length: 10 }),
  profileId: varchar('profile_id', { length: 36 }),
  oauthProvider: varchar('oauth_provider', { length: 30 }),
  refreshToken: varchar('refresh_token', { length: 500 }),
  suspendedAt: timestamp('suspended_at'),
  role: varchar('role', { length: 10 })
    .notNull()
    .default(Role.USER)
    .$type<Role>(),
  ...timestamps,
});
