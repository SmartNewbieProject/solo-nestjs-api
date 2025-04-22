import { timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from 'uuidv7';

export const timestamps = {
  updatedAt: timestamp('updated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

export const uuid = () =>
  varchar({ length: 128 })
    .notNull()
    .primaryKey();
    
export const generateUuidV7 = () => uuidv7();
