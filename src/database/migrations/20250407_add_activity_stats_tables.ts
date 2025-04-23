import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    -- 일간 활동 통계 테이블
    CREATE TABLE IF NOT EXISTS activity_stats (
      id VARCHAR(128) PRIMARY KEY,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      dau INTEGER NOT NULL,
      hourly_distribution JSONB NOT NULL,
      activity_counts JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    -- 주간 활동 통계 테이블
    CREATE TABLE IF NOT EXISTS weekly_activity_stats (
      id VARCHAR(128) PRIMARY KEY,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      wau INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    -- 월간 활동 통계 테이블
    CREATE TABLE IF NOT EXISTS monthly_activity_stats (
      id VARCHAR(128) PRIMARY KEY,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      mau INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_activity_stats_date ON activity_stats(date);
    CREATE INDEX IF NOT EXISTS idx_weekly_activity_stats_date ON weekly_activity_stats(start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_monthly_activity_stats_date ON monthly_activity_stats(start_date, end_date);
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_monthly_activity_stats_date;
    DROP INDEX IF EXISTS idx_weekly_activity_stats_date;
    DROP INDEX IF EXISTS idx_activity_stats_date;
    DROP TABLE IF EXISTS monthly_activity_stats;
    DROP TABLE IF EXISTS weekly_activity_stats;
    DROP TABLE IF EXISTS activity_stats;
  `);
}
