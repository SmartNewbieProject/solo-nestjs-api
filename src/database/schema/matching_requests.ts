import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const matchingRequests = pgTable('matching_requests', {
  id: uuid(),
  userId: varchar('user_id', { length: 128 }),
  score: varchar('score', { length: 36 }),
  ...timestamps,
});
