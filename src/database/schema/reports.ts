import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const reports = pgTable('reports', {
  id: uuid('id'),
  reporterId: varchar('reporter_id', { length: 128 }),
  reportedId: varchar('reported_id', { length: 128 }),
  reason: varchar('reason', { length: 255 }),
  status: varchar('status', { length: 15 }),
  ...timestamps,
});
