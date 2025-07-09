import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { uuid } from './helper';

export const versionUpdates = pgTable('version_updates', {
  id: uuid(),
  version: varchar({ length: 20 }).notNull(),
  metadata: jsonb().default({ description: ['신규 버전'] }),
  shouldUpdate: boolean('should_update').default(false),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});
