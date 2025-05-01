import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    database: process.env.DATABASE_NAME!,
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    ssl: false,
  },
  strict: false,
  breakpoints: false,
});
