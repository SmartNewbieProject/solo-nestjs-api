import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";
import { timestamps, uuid } from "./helper";

export const smsAuthorization = pgTable('sms_authorization', {
  id: uuid(),
  phoneNumber: varchar('phone_number', { length: 15 }).notNull(),
  uniqueKey: varchar('unique_key', { length: 62 }).notNull(),
  authorizationCode: varchar('authorization_code', { length: 12 }).notNull(),
  is_authorized: boolean('is_authorized').default(false).notNull(),
  ...timestamps,
});
