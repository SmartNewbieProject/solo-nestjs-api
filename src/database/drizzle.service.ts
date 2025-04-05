import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private _db: ReturnType<typeof drizzle<typeof schema>>;
  private _pool: Pool;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this._pool = new Pool({
      host: this.configService.get<string>('DATABASE_HOST', '221.158.74.191'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      user: this.configService.get<string>('DATABASE_USER', 'deveungi'),
      password: this.configService.get<string>('DATABASE_PASSWORD', 'smartnewb2'),
      database: this.configService.get<string>('DATABASE_NAME', 'solo'),
      // 대용량 데이터 처리를 위한 추가 설정
      max: 20, // 최대 연결 수
      idleTimeoutMillis: 30000, // 연결 유휴 시간
      connectionTimeoutMillis: 10000, // 연결 타임아웃
      statement_timeout: 60000, // SQL 문 실행 타임아웃 (ms)
    });

    this._db = drizzle(this._pool, { schema });
  }

  get db(): ReturnType<typeof drizzle<typeof schema>> {
    return this._db;
  }
  
  getPool(): Pool {
    return this._pool;
  }

  async onModuleDestroy() {
    await this._pool.end();
  }
}
