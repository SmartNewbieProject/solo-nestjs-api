import { timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from 'uuidv7';

export const timestamps = {
  updatedAt: timestamp('updated_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
};

export const uuid = () =>
  varchar({ length: 128 })
    .notNull()
    .primaryKey();

export const generateUuidV7 = () => uuidv7();
