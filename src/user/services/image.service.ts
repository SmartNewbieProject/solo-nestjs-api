import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { generateUuidV7 } from '@database/schema/helper';
import { S3Service } from '@/common/services/s3.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly s3Service: S3Service,
  ) {}

  async saveProfileImage(
    userId: string,
    imageKey: string,
    imageUrl: string,
    isMain: boolean = false,
  ) {
    return await this.db.transaction(async (tx) => {
      const profile = await tx.query.profiles.findFirst({
        where: eq(schema.profiles.userId, userId),
      });

      if (!profile) {
        throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
      }
      const existingImages = await tx.query.profileImages.findMany({
        where: eq(schema.profileImages.profileId, profile.id),
      });

      if (existingImages.length >= 3) {
        throw new BadRequestException('프로필 이미지는 최대 3개까지만 등록할 수 있습니다.');
      }

      const imageId = generateUuidV7();
      await tx.insert(schema.images).values({
        id: imageId,
        s3Url: imageUrl,
        s3Key: imageKey,
        mimeType: 'image/jpeg',
        isVerified: true,
      });

      const profileImageId = generateUuidV7();
      
      if (isMain) {
        await tx.update(schema.profileImages)
          .set({ isMain: false })
          .where(eq(schema.profileImages.profileId, profile.id));
      }

      const imageOrder = existingImages.length + 1;
      
      await tx.insert(schema.profileImages).values({
        id: profileImageId,
        profileId: profile.id,
        imageId: imageId,
        isMain,
        imageOrder,
      });

      return {
        id: profileImageId,
        imageId,
        url: imageUrl,
        key: imageKey,
        isMain,
        order: imageOrder,
      };
    });
  }

  async deleteProfileImage(userId: string, profileImageId: string) {
    return await this.db.transaction(async (tx) => {
      const profile = await tx.query.profiles.findFirst({
        where: eq(schema.profiles.userId, userId),
      });

      if (!profile) {
        throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
      }

      const profileImage = await tx.query.profileImages.findFirst({
        where: eq(schema.profileImages.id, profileImageId),
        with: {
          image: true,
        },
      });

      if (!profileImage || profileImage.profileId !== profile.id) {
        throw new NotFoundException('프로필 이미지를 찾을 수 없습니다.');
      }

      await tx.update(schema.profileImages)
        .set({ deletedAt: new Date() })
        .where(eq(schema.profileImages.id, profileImageId));

      if (profileImage.isMain) {
        const nextMainImage = await tx.query.profileImages.findFirst({
          where: and(eq(schema.profileImages.profileId, profile.id), isNull(schema.profileImages.deletedAt)),
          orderBy: schema.profileImages.imageOrder,
        });

        if (nextMainImage) {
          await tx.update(schema.profileImages)
            .set({ isMain: true })
            .where(and(eq(schema.profileImages.id, nextMainImage.id), isNull(schema.profileImages.deletedAt)));
        }
      }
    });
  }

  async setMainProfileImage(userId: string, profileImageId: string) {
    return await this.db.transaction(async (tx) => {
      const profile = await tx.query.profiles.findFirst({
        where: eq(schema.profiles.userId, userId),
      });

      if (!profile) {
        throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
      }

      const profileImage = await tx.query.profileImages.findFirst({
        where: eq(schema.profileImages.id, profileImageId),
      });

      if (!profileImage || profileImage.profileId !== profile.id) {
        throw new NotFoundException('프로필 이미지를 찾을 수 없습니다.');
      }

      await tx.update(schema.profileImages)
        .set({ isMain: false })
        .where(eq(schema.profileImages.profileId, profile.id));

      await tx.update(schema.profileImages)
        .set({ isMain: true })
        .where(eq(schema.profileImages.id, profileImageId));
    });
  }
}
