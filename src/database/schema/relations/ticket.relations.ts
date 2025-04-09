import { relations } from "drizzle-orm";
import { users } from "../users";
import { tickets } from "../ticket";

export const ticketRelations = relations(tickets, ({ one }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id]
  }),
}));
