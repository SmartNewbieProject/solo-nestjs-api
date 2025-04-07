import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDrizzle } from "@common/decorators";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { PreferenceSave } from "../dto/profile.dto";
import { generateUuidV7 } from "@database/schema/helper";
import { ProfileRawDetails, ProfileSummary } from "@/types/user";

@Injectable()
export default class ProfileRepository {
    constructor(
      @InjectDrizzle()
      private readonly db: NodePgDatabase<typeof schema>,
    ) {}

  async getProfileSummary(userId: string): Promise<ProfileSummary> {
    const result = await this.db.select({
      id: schema.profiles.id,
      name: schema.profiles.name,
      age: schema.profiles.age,
      gender: schema.profiles.gender,
      title: schema.profiles.title,
      introduction: schema.profiles.introduction,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, userId))
    .execute();

    if (result.length === 0) {
      throw new NotFoundException('프로필 정보를 찾을 수 없습니다.');
    }


    return {
      id: result[0].id,
      name: result[0].name,
      age: result[0].age,
      gender: result[0].gender,
      title: result[0].title,
      introduction: result[0].introduction,
    };
  }

  async getProfileDetails(userId: string): Promise<ProfileRawDetails | null> {
    const profile = await this.db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId),
      with: {
        universityDetail: true,
      }
    }).execute();
    
    if (!profile) return null;
    
    try {
      const profileImages = await this.db.select()
        .from(schema.profileImages)
        .where(and(eq(schema.profileImages.profileId, profile.id), isNull(schema.profileImages.deletedAt)))
        .innerJoin(schema.images, eq(schema.profileImages.imageId, schema.images.id))
        .execute();
      return {
        ...profile,
        universityDetail: profile.universityDetail ? {
          name: profile.universityDetail.universityName,
          authentication: profile.universityDetail.authentication,
          department: profile.universityDetail.department
        } : null,
        profileImages: profileImages.map(({ images: { s3Url }, profile_images: { imageOrder, isMain, id } }) => ({
          id,
          order: imageOrder,
          isMain,
          url: s3Url,
        }))
      };
    } catch (error) {
      return {
        ...profile,
        universityDetail: profile.universityDetail ? {
          name: profile.universityDetail.universityName,
          authentication: profile.universityDetail.authentication,
          department: profile.universityDetail.department
        } : null,
        profileImages: []
      };
    }
  }

  async getPreferenceTypeByName(typeName: string) {
    return await this.db.query.preferenceTypes.findFirst({
      where: eq(schema.preferenceTypes.name, typeName)
    });
  }

  async getUserPreferenceOptions(userId: string) {
    return await this.db.transaction(async (tx) => {
      const userPreference = await tx.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId)
      });
      
      if (!userPreference) {
        throw new NotFoundException('사용자 선호도 정보를 찾을 수 없습니다.');
      }

      const userPreferenceOptions = await tx.select({
        optionId: schema.userPreferenceOptions.preferenceOptionId,
        optionDisplayName: schema.preferenceOptions.displayName,
        typeName: schema.preferenceTypes.name,
      })
      .from(schema.userPreferenceOptions)
      .innerJoin(
        schema.preferenceOptions,
        eq(schema.userPreferenceOptions.preferenceOptionId, schema.preferenceOptions.id)
      )
      .innerJoin(
        schema.preferenceTypes,
        eq(schema.preferenceOptions.preferenceTypeId, schema.preferenceTypes.id)
      )
      .where(eq(schema.userPreferenceOptions.userPreferenceId, userPreference.id));

      return userPreferenceOptions;
    });
  }

  async updateInstagramId(userId: string, instagramId: string) {
    return await this.db.update(schema.profiles)
      .set({ instagramId })
      .where(eq(schema.profiles.userId, userId));
  }
  
  async getAllPreferences() {
    return await this.db.select({
      typeName: schema.preferenceTypes.name,
      multiple: schema.preferenceTypes.multiSelect,
      maximumChoiceCount: schema.preferenceTypes.maximumChoiceCount,
      optionId: schema.preferenceOptions.id,
      optionDisplayName: schema.preferenceOptions.displayName,
    })
      .from(schema.preferenceOptions)
      .innerJoin(
        schema.preferenceTypes,
        eq(schema.preferenceOptions.preferenceTypeId, schema.preferenceTypes.id)
      )
      .orderBy(schema.preferenceTypes.code);
  }

  async updatePreferences(userId: string, data: PreferenceSave['data']) {
    return await this.db.transaction(async (tx) => {
      const userPreferenceId = await this.getUserPreferenceId(tx, userId);
      await this.deleteExistingOptions(tx, userPreferenceId);

      if (data.length === 0) return;
      await this.insertPreferenceOptions(tx, userPreferenceId, data);
    });
  }
  
  async getUserPreferenceId(tx: any, userId: string): Promise<string> {
    const userPreference = await tx.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.userId, userId)
    });
    
    if (!userPreference) {
      throw new Error('사용자 선호도 정보를 찾을 수 없습니다.');
    }
    
    return userPreference.id;
  }

  async updateNickname(userId: string, nickname: string) {
    return await this.db.update(schema.profiles)
      .set({ name: nickname })
      .where(eq(schema.profiles.userId, userId));
  }
  
  private async deleteExistingOptions(tx: any, userPreferenceId: string): Promise<void> {
    await tx.delete(schema.userPreferenceOptions)
      .where(eq(schema.userPreferenceOptions.userPreferenceId, userPreferenceId));
  }
  
  private async insertPreferenceOptions(tx: any, userPreferenceId: string, data: PreferenceSave['data']): Promise<void> {
    const preferencePromises = data.map(async (preference) => {
      const preferenceType = await tx.query.preferenceTypes.findFirst({
        where: eq(schema.preferenceTypes.name, preference.typeName)
      });
      
      if (!preferenceType || preference.optionIds.length === 0) return;

      const optionPromises = preference.optionIds.map(async (optionId) => {
        const optionEntryId = generateUuidV7();
        const now = new Date();
        
        await tx.insert(schema.userPreferenceOptions)
          .values({
            id: optionEntryId,
            userPreferenceId,
            preferenceOptionId: optionId,
            createdAt: now,
            updatedAt: now,
            deletedAt: null
          });
      });
      
      await Promise.all(optionPromises);
    });
    
    await Promise.all(preferencePromises);
  }

}
