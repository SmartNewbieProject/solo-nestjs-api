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
          user: configService.get('DATABASE_USER'),
          host: configService.get('DATABASE_HOST'),
          password: configService.get('DATABASE_PASSWORD'),
          port: configService.get('DATABASE_PORT'),
          database: configService.get('DATABASE_NAME'),
        });

        return drizzle(pool, { schema, casing: 'snake_case' });
      },
    },
    DatabaseService,
  ],
  exports: ['DRIZZLE_ORM', DatabaseService],
})
export class DatabaseModule {}
