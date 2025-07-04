import { relations } from 'drizzle-orm';
import { profileImages } from '../profile_images';
import { profiles } from '../profiles';
import { images } from '../images';

export const profileImagesRelations = relations(profileImages, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileImages.profileId],
    references: [profiles.id],
  }),
  image: one(images, {
    fields: [profileImages.imageId],
    references: [images.id],
  }),
}));
