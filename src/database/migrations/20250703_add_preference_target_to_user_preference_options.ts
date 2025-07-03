import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.execute(sql`
    CREATE TYPE preference_target AS ENUM ('SELF', 'PARTNER');
  `);

  await db.execute(sql`
    ALTER TABLE user_preference_options 
    ADD COLUMN preference_target preference_target NOT NULL DEFAULT 'PARTNER';
  `);

  await db.execute(sql`
    UPDATE user_preference_options 
    SET preference_target = 'PARTNER' 
    WHERE preference_target IS NULL;
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_user_preference_options_preference_target 
    ON user_preference_options(preference_target);
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    DROP INDEX IF EXISTS idx_user_preference_options_preference_target;
  `);

  await db.execute(sql`
    ALTER TABLE user_preference_options 
    DROP COLUMN preference_target;
  `);

  await db.execute(sql`
    DROP TYPE preference_target;
  `);
}
