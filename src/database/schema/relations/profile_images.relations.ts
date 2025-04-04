import { relations } from 'drizzle-orm';
import { profileImages } from '../profile_images';
import { profiles } from '../profiles';
import { images } from '../images';

export const profileImagesRelations = relations(profileImages, ({ many }) => ({
  profile: many(profiles),
  image: many(images),
}));
