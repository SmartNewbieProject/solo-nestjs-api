import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DRIZZLE_ORM',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          user: 'postgres',
          host: 'localhost',
          port: 5432,
          database: 'solo',
        });

        return drizzle(pool, { schema });
      },
    },
    DatabaseService,
  ],
  exports: ['DRIZZLE_ORM', DatabaseService],
})
export class DatabaseModule {}
