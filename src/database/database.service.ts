import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DRIZZLE_ORM')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // 데이터베이스 연결 테스트
  async testConnection(): Promise<boolean> {
    try {
      // 간단한 쿼리 실행
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error('데이터베이스 연결 테스트 실패:', error);
      return false;
    }
  }
}
