import { timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from 'uuidv7';

export const timestamps = {
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
  }),
};

export const uuid = () =>
  varchar({ length: 128 })
    .notNull()
    .primaryKey();
    
export const generateUuidV7 = () => uuidv7();
