import { pgTable, varchar, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { RegionCode } from '@/types/enum';

export const universities = pgTable('universities', {
  id: uuid(),
  name: varchar('name', { length: 100 }).notNull(),
  region: varchar('region').$type<RegionCode>().notNull(),
  code: varchar('code', { length: 20 }).unique(),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
});
