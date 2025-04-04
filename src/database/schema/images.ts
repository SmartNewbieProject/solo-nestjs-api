import { pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const images = pgTable('images', {
  id: uuid(),
  s3Url: varchar('s3_url', { length: 255 }),
  s3Key: varchar('s3_key', { length: 255 }),
  originalFilename: varchar('original_filename', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeInBytes: integer('size_in_bytes'),
  isVerified: boolean('is_verified').default(false),
  ...timestamps,
});
