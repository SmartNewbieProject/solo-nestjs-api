import { pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';

export const profileImages = pgTable('profile_images', {
  id: uuid(),
  profileId: varchar('profile_id', { length: 36 }),
  imageId: varchar('image_id', { length: 36 }),
  imageOrder: integer('image_order'),
  isMain: boolean('is_main').default(false),
  ...timestamps,
});
