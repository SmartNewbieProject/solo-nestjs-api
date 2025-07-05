import { date, decimal, integer, pgTable } from 'drizzle-orm/pg-core';
import { timestamps, uuid } from './helper';
import { featureTypeEnum } from './gem_feature_costs';

export const gemDailyStats = pgTable('gem_daily_stats', {
  statId: uuid(),
  date: date('date').notNull(),
  featureType: featureTypeEnum('feature_type').notNull(),
  totalUsageCount: integer('total_usage_count').notNull().default(0),
  totalGemsConsumed: integer('total_gems_consumed').notNull().default(0),
  uniqueUsers: integer('unique_users').notNull().default(0),
  successRate: decimal('success_rate', { precision: 5, scale: 2 })
    .notNull()
    .default('0.00'),
  createdAt: timestamps.createdAt,
});
