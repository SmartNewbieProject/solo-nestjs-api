import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  private _pool: Pool;

  constructor(
    @Inject('DRIZZLE_ORM')
    private readonly dbConnection: NodePgDatabase<typeof schema>
  ) {}

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
