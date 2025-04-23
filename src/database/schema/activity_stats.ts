import { pgTable, timestamp, json, integer } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

/**
 * 일간 활동 통계 테이블
 */
export const activityStats = pgTable('activity_stats', {
  id: uuid(),
  date: timestamp('date').notNull(),
  dau: integer('dau').notNull(),
  hourlyDistribution: json('hourly_distribution').notNull(),
  activityCounts: json('activity_counts').notNull(),
  ...timestamps,
});

/**
 * 주간 활동 통계 테이블
 */
export const weeklyActivityStats = pgTable('weekly_activity_stats', {
  id: uuid(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  wau: integer('wau').notNull(),
  ...timestamps,
});

/**
 * 월간 활동 통계 테이블
 */
export const monthlyActivityStats = pgTable('monthly_activity_stats', {
  id: uuid(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  mau: integer('mau').notNull(),
  ...timestamps,
});
