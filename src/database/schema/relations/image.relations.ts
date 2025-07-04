import { relations } from 'drizzle-orm';
import { images } from '../images';
import { profileImages } from '../profile_images';

export const imageRelations = relations(images, ({ many }) => ({
  profileImages: many(profileImages, {
    relationName: 'image',
  }),
}));
