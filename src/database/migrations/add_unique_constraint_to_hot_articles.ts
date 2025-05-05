import { sql } from 'drizzle-orm';

export async function up(db: any): Promise<void> {
  // 중복 데이터 정리
  await db.execute(sql`
    WITH duplicates AS (
      SELECT article_id, MIN(id) as keep_id
      FROM hot_articles
      WHERE deleted_at IS NULL
      GROUP BY article_id
      HAVING COUNT(*) > 1
    )
    UPDATE hot_articles
    SET deleted_at = NOW()
    WHERE id IN (
      SELECT h.id
      FROM hot_articles h
      JOIN duplicates d ON h.article_id = d.article_id
      WHERE h.id != d.keep_id
    );
  `);

  // 고유 제약 조건 추가
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS hot_articles_article_id_unique_idx
    ON hot_articles (article_id)
    WHERE deleted_at IS NULL;
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS hot_articles_article_id_unique_idx;
  `);
}
