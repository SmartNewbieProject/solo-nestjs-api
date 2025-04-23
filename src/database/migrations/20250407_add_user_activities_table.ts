import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_activities (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL REFERENCES users(id),
      activity_type VARCHAR(50) NOT NULL,
      activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    );
    
    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activities_activity_at ON user_activities(activity_at);
    CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_user_activities_activity_type;
    DROP INDEX IF EXISTS idx_user_activities_activity_at;
    DROP INDEX IF EXISTS idx_user_activities_user_id;
    DROP TABLE IF EXISTS user_activities;
  `);
}
