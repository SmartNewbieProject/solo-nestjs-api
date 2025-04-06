import { sql } from 'drizzle-orm';
import { pgTable, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { timestamps } from '../schema/helper';

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS likes (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL REFERENCES users(id),
      article_id VARCHAR(128) NOT NULL REFERENCES articles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      UNIQUE(user_id, article_id)
    );
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS likes;`);
}
