import { pgEnum, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { uuid, timestamps } from "./helper";
import { users } from "./users";

// export const ticketTypeEnum = pgEnum('ticket_type', ['rematching']);
// export const ticketStatusEnum = pgEnum('ticket_status', ['used', 'expired']);

export const tickets = pgTable('tickets', {
  id: uuid(),
  name: varchar('name', { length: 30 }).notNull(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id).notNull(),
  status: varchar('status', { length: 10 }).notNull(),
  type: varchar('type', { length: 10 }).notNull(),
  usedAt: timestamp('used_at'),
  expiredAt: timestamp('expired_at'),
  ...timestamps,
});
