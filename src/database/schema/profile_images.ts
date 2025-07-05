import { pgTable, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { uuid, timestamps } from './helper';
import { images } from './images';
import { profiles } from './profiles';

export const profileImages = pgTable('profile_images', {
  id: uuid().primaryKey(),
  profileId: varchar('profile_id', { length: 36 })
    .references(() => profiles.id)
    .notNull(),
  imageId: varchar('image_id', { length: 36 })
    .references(() => images.id)
    .notNull(),
  imageOrder: integer('image_order').notNull(),
  isMain: boolean('is_main').default(false).notNull(),
  ...timestamps,
});
