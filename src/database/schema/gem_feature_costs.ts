import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { timestamps, uuid } from './helper';

export const featureTypeEnum = pgEnum('feature_type', [
  'PROFILE_OPEN',
  'LIKE_MESSAGE',
  'CHAT_START',
  'PREMIUM_FILTER',
]);

export const gemFeatureCosts = pgTable('gem_feature_costs', {
  costId: uuid(),
  featureType: featureTypeEnum('feature_type').notNull().unique(),
  gemCost: integer('gem_cost').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  effectiveFrom: timestamp('effective_from', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  ...timestamps,
});
