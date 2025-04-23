import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    -- 탈퇴 사유 열거형 생성
    CREATE TYPE withdrawal_reason_type AS ENUM (
      'FOUND_PARTNER',
      'POOR_MATCHING',
      'PRIVACY_CONCERN',
      'SAFETY_CONCERN',
      'TECHNICAL_ISSUES',
      'INACTIVE_USAGE',
      'DISSATISFIED_SERVICE',
      'OTHER'
    );

    -- 탈퇴 사유 테이블 생성
    CREATE TABLE IF NOT EXISTS withdrawal_reasons (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      reason withdrawal_reason_type NOT NULL,
      detail TEXT,
      withdrawn_at TIMESTAMP WITH TIME ZONE NOT NULL,
      service_duration_days INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE,
      deleted_at TIMESTAMP WITH TIME ZONE
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_withdrawal_reasons_user_id ON withdrawal_reasons(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_reasons_reason ON withdrawal_reasons(reason);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_reasons_withdrawn_at ON withdrawal_reasons(withdrawn_at);
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_withdrawal_reasons_withdrawn_at;
    DROP INDEX IF EXISTS idx_withdrawal_reasons_reason;
    DROP INDEX IF EXISTS idx_withdrawal_reasons_user_id;
    DROP TABLE IF EXISTS withdrawal_reasons;
    DROP TYPE IF EXISTS withdrawal_reason_type;
  `);
}
