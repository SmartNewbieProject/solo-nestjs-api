import { Global, Module, Logger } from '@nestjs/common';
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
        const env = configService.get('NODE_ENV');

        const pool = new Pool({
          user: configService.get('DATABASE_USER'),
          host: configService.get('DATABASE_HOST'),
          password: configService.get('DATABASE_PASSWORD'),
          port: configService.get('DATABASE_PORT'),
          database: configService.get('DATABASE_NAME'),
        });

        const logger = new Logger('SQL');
        
        return drizzle(pool, { 
          schema, 
          casing: 'snake_case',
          logger: {
            logQuery: (query, params) => {
              if (env !== 'development') return;
              logger.debug(`쿼리: ${query}`);
              if (params && params.length > 0) {
                logger.debug(`파라미터: ${JSON.stringify(params)}`);
              }
            },
          },
        });
      },
    },
    DatabaseService,
  ],
  exports: ['DRIZZLE_ORM', DatabaseService],
})
export class DatabaseModule {}
