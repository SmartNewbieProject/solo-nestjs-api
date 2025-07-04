import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DrizzleService {
  private _pool: Pool;

  constructor(
    @Inject('DRIZZLE_ORM')
    private readonly dbConnection: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {
    this._pool = new Pool({
      user: this.configService.get('DATABASE_USER'),
      host: this.configService.get('DATABASE_HOST'),
      password: this.configService.get('DATABASE_PASSWORD'),
      port: this.configService.get('DATABASE_PORT'),
      database: this.configService.get('DATABASE_NAME'),
    });

    this._pool.on('connect', (client) => {
      client.query("SET timezone = 'Asia/Seoul'");
    });
  }

  get db(): NodePgDatabase<typeof schema> {
    return this.dbConnection;
  }

  getPool(): Pool {
    return this._pool;
  }

  async onModuleDestroy() {
    await this._pool.end();
  }
}
