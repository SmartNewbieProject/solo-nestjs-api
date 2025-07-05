import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// 환경 변수 로드
config();

async function runMigrations() {
  const configService = new ConfigService();

  // 데이터베이스 연결 설정
  const pool = new Pool({
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    user: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
  });

  // Drizzle 인스턴스 생성
  const db = drizzle(pool);

  console.log('마이그레이션 시작...');

  // 마이그레이션 실행
  await migrate(db, { migrationsFolder: 'drizzle/migrations' });

  console.log('마이그레이션 완료!');

  // 연결 종료
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('마이그레이션 중 오류 발생:', err);
  process.exit(1);
});
