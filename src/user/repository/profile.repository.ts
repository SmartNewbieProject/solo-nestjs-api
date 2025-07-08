import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { PreferenceTarget } from '@database/schema';
import {
  and,
  asc,
  eq,
  ExtractTablesWithRelations,
  inArray,
  isNull,
} from 'drizzle-orm';
import {
  PreferenceData,
  PreferenceSave,
  SelfPreferencesSave,
  PartnerPreferencesSave,
} from '../dto/profile.dto';
import { generateUuidV7 } from '@database/schema/helper';
import {
  MbtiPreferences,
  ProfileRawDetails,
  ProfileSummary,
} from '@/types/user';
import { UserRank } from '@/database/schema/profiles';
import { PreferenceTarget as PreferenceTargetEnum } from '@/database/schema/enums';
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<
  PgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

const COMMON_CODES = [
  'personality',
  'DATING_STYLE',
  'DRINKING',
  'SMOKING',
  'TATTOO',
  'MILITARY_STATUS_MALE',
  'MILITARY_PREFERENCE_FEMALE',
];

@Injectable()
export default class ProfileRepository {
  private readonly SELF_CODES: string[] = ['INTEREST', ...COMMON_CODES];
  private readonly PARTNER_CODES: string[] = [
    'AGE_PREFERENCE',
    ...COMMON_CODES,
  ];

  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getProfileSummary(userId: string): Promise<ProfileSummary> {
    const result = await this.db
      .select({
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
    const profileResults = await this.db
      .select()
      .from(schema.profiles)
      .leftJoin(
        schema.universityDetails,
        eq(schema.universityDetails.userId, userId),
      )
      .where(eq(schema.profiles.userId, userId))
      .execute();

    if (profileResults.length === 0) return null;

    const union = profileResults[0];
    const profileImages = await this.db
      .select()
      .from(schema.profileImages)
      .where(
        and(
          eq(schema.profileImages.profileId, union.profiles.id),
          isNull(schema.profileImages.deletedAt),
        ),
      )
      .innerJoin(
        schema.images,
        eq(schema.profileImages.imageId, schema.images.id),
      )
      .execute();

    return {
      ...union.profiles,
      mbti: union.profiles.mbti,
      rank: union.profiles.rank as UserRank,
      universityDetail: union.university_details
        ? {
            name: union.university_details.universityName,
            authentication: union.university_details.authentication,
            department: union.university_details.department,
            grade: union.university_details.grade,
            studentNumber: union.university_details.studentNumber,
          }
        : null,
      profileImages: profileImages.map(
        ({
          images: { s3Url },
          profile_images: { imageOrder, isMain, id },
        }) => ({
          id,
          order: imageOrder,
          isMain,
          url: s3Url,
        }),
      ),
    };
  }

  async getPreferenceTypeByName(typeName: string) {
    return this.db.query.preferenceTypes.findFirst({
      where: eq(schema.preferenceTypes.name, typeName),
    });
  }

  async getUserPreferenceOptions(userId: string, who: PreferenceTarget) {
    return await this.db.transaction(async (tx) => {
      const userPreference = await tx.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId),
      });

      if (!userPreference) {
        throw new NotFoundException('사용자 선호도 정보를 찾을 수 없습니다.');
      }

      return tx
        .select({
          optionId: schema.userPreferenceOptions.preferenceOptionId,
          optionDisplayName: schema.preferenceOptions.displayName,
          typeName: schema.preferenceTypes.name,
        })
        .from(schema.userPreferenceOptions)
        .innerJoin(
          schema.preferenceOptions,
          eq(
            schema.userPreferenceOptions.preferenceOptionId,
            schema.preferenceOptions.id,
          ),
        )
        .innerJoin(
          schema.preferenceTypes,
          eq(
            schema.preferenceOptions.preferenceTypeId,
            schema.preferenceTypes.id,
          ),
        )
        .where(
          and(
            eq(
              schema.userPreferenceOptions.userPreferenceId,
              userPreference.id,
            ),
            eq(schema.userPreferenceOptions.preferenceTarget, who),
            eq(schema.preferenceOptions.deprecated, false),
          ),
        )
        .orderBy(asc(schema.preferenceOptions.order));
    });
  }

  updateInstagramId(userId: string, instagramId: string) {
    return this.db
      .update(schema.profiles)
      .set({ instagramId })
      .where(eq(schema.profiles.userId, userId));
  }

  getPreferences(target: PreferenceTargetEnum) {
    const CASES =
      target === PreferenceTarget.PARTNER
        ? this.PARTNER_CODES
        : this.SELF_CODES;

    return this.db
      .select({
        typeName: schema.preferenceTypes.name,
        multiple: schema.preferenceTypes.multiSelect,
        maximumChoiceCount: schema.preferenceTypes.maximumChoiceCount,
        optionId: schema.preferenceOptions.id,
        optionDisplayName: schema.preferenceOptions.displayName,
      })
      .from(schema.preferenceOptions)
      .innerJoin(
        schema.preferenceTypes,
        eq(
          schema.preferenceOptions.preferenceTypeId,
          schema.preferenceTypes.id,
        ),
      )
      .orderBy(schema.preferenceTypes.code, asc(schema.preferenceOptions.order))
      .where(
        and(
          inArray(schema.preferenceTypes.code, CASES),
          eq(schema.preferenceOptions.deprecated, false),
        ),
      );
  }

  async updatePreferences(userId: string, data: PreferenceSave['data']) {
    return await this.db.transaction(async (tx) => {
      const userPreferenceId = await this.getUserPreferenceId(tx, userId);
      await this.deleteExistingOptions(tx, userPreferenceId);

      if (data.length === 0) return;
      await this.insertPreferenceOptions(tx, userPreferenceId, data);
    });
  }

  async getUserPreferenceId(tx: Transaction, userId: string): Promise<string> {
    const userPreference = await tx.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.userId, userId),
    });

    if (!userPreference) {
      throw new Error('사용자 선호도 정보를 찾을 수 없습니다.');
    }

    return userPreference.id;
  }

  updateNickname(userId: string, nickname: string) {
    return this.db
      .update(schema.profiles)
      .set({ name: nickname })
      .where(eq(schema.profiles.userId, userId));
  }

  private async deleteExistingOptions(
    tx: Transaction,
    userPreferenceId: string,
  ): Promise<void> {
    await tx
      .delete(schema.userPreferenceOptions)
      .where(
        eq(schema.userPreferenceOptions.userPreferenceId, userPreferenceId),
      );
  }

  private async insertPreferenceOptions(
    tx: Transaction,
    userPreferenceId: string,
    data: PreferenceSave['data'],
  ): Promise<void> {
    const preferencePromises = data.map(async (preference) => {
      const preferenceType = await tx.query.preferenceTypes.findFirst({
        where: eq(schema.preferenceTypes.name, preference.typeName),
      });

      if (!preferenceType) {
        throw new Error(
          `선호도 타입을 찾을 수 없습니다: ${preference.typeName}`,
        );
      }

      if (preference.optionIds.length === 0) return;

      if (preference.typeName === '선호 나이대') {
        await this.insertAgePreferenceOption(
          tx,
          userPreferenceId,
          preference.optionIds[0],
        );
        return;
      }

      await this.insertNormalPreferenceOptions(
        tx,
        userPreferenceId,
        preference.optionIds,
      );
    });

    await Promise.all(preferencePromises);
  }

  private async insertAgePreferenceOption(
    tx: Transaction,
    userPreferenceId: string,
    selectedValue: string,
  ): Promise<void> {
    const agePreferenceType = await tx.query.preferenceTypes.findFirst({
      where: eq(schema.preferenceTypes.code, 'AGE_PREFERENCE'),
    });

    if (!agePreferenceType) {
      throw new Error('선호 나이대 타입을 찾을 수 없습니다');
    }

    const ageOption = await tx.query.preferenceOptions.findFirst({
      where: and(
        eq(schema.preferenceOptions.preferenceTypeId, agePreferenceType.id),
        eq(schema.preferenceOptions.value, selectedValue),
      ),
    });

    if (!ageOption) {
      throw new Error(`선호 나이대 옵션을 찾을 수 없습니다: ${selectedValue}`);
    }

    await this.insertUserPreferenceOption(tx, userPreferenceId, ageOption.id);
  }

  private async insertNormalPreferenceOptions(
    tx: Transaction,
    userPreferenceId: string,
    optionIds: string[],
  ): Promise<void> {
    const optionPromises = optionIds.map(async (optionId) => {
      await this.insertUserPreferenceOption(tx, userPreferenceId, optionId);
    });

    await Promise.all(optionPromises);
  }

  private async insertUserPreferenceOption(
    tx: Transaction,
    userPreferenceId: string,
    preferenceOptionId: string,
    preferenceTarget: PreferenceTarget = PreferenceTarget.PARTNER,
  ): Promise<void> {
    const optionEntryId = generateUuidV7();
    const now = new Date();

    await tx.insert(schema.userPreferenceOptions).values({
      id: optionEntryId,
      userPreferenceId,
      preferenceOptionId,
      preferenceTarget,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  async getMbti(userId: string) {
    const results = await this.db
      .select({
        mbti: schema.profiles.mbti,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.userId, userId));
    return results[0]?.mbti;
  }

  updateMbti(userId: string, mbti: string) {
    return this.db
      .update(schema.profiles)
      .set({ mbti })
      .where(eq(schema.profiles.userId, userId));
  }

  async getUserSelfPreferenceOptions(userId: string) {
    return await this.db.transaction(async (tx) => {
      const userPreference = await tx.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId),
      });

      if (!userPreference) {
        throw new NotFoundException('사용자 선호도 정보를 찾을 수 없습니다.');
      }

      return tx
        .select({
          optionId: schema.userPreferenceOptions.preferenceOptionId,
          optionDisplayName: schema.preferenceOptions.displayName,
          typeName: schema.preferenceTypes.name,
        })
        .from(schema.userPreferenceOptions)
        .innerJoin(
          schema.preferenceOptions,
          eq(
            schema.userPreferenceOptions.preferenceOptionId,
            schema.preferenceOptions.id,
          ),
        )
        .innerJoin(
          schema.preferenceTypes,
          eq(
            schema.preferenceOptions.preferenceTypeId,
            schema.preferenceTypes.id,
          ),
        )
        .where(
          and(
            eq(
              schema.userPreferenceOptions.userPreferenceId,
              userPreference.id,
            ),
            eq(
              schema.userPreferenceOptions.preferenceTarget,
              PreferenceTarget.SELF,
            ),
            eq(schema.preferenceOptions.deprecated, false),
          ),
        )
        .orderBy(asc(schema.preferenceOptions.order));
    });
  }

  async updateSelfPreferences(userId: string, data: SelfPreferencesSave) {
    return await this.db.transaction(async (tx) => {
      const userPreferenceId = await this.getUserPreferenceId(tx, userId);
      await this.deleteExistingSelfOptions(tx, userPreferenceId);

      if (data.preferences.length === 0) return;
      await this.insertSelfPreferenceOptions(
        tx,
        userPreferenceId,
        data.preferences,
      );
    });
  }

  private async deleteExistingSelfOptions(
    tx: Transaction,
    userPreferenceId: string,
  ): Promise<void> {
    await tx
      .delete(schema.userPreferenceOptions)
      .where(
        and(
          eq(schema.userPreferenceOptions.userPreferenceId, userPreferenceId),
          eq(
            schema.userPreferenceOptions.preferenceTarget,
            PreferenceTarget.SELF,
          ),
        ),
      );
  }

  private async insertAdditionalSelfOptions(
    tx: Transaction,
    profileId: string,
    additionalPreferences: MbtiPreferences,
  ) {
    await tx.insert(schema.additionalPreferences).values({
      id: generateUuidV7(),
      profileId,
      ...additionalPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async insertSelfPreferenceOptions(
    tx: Transaction,
    userPreferenceId: string,
    data: PreferenceData[],
  ): Promise<void> {
    const preferencePromises = data.map(async (preference) => {
      const preferenceType = await tx.query.preferenceTypes.findFirst({
        where: eq(schema.preferenceTypes.name, preference.typeName),
      });

      if (!preferenceType) {
        throw new Error(
          `선호도 타입을 찾을 수 없습니다: ${preference.typeName}`,
        );
      }

      if (preference.optionIds.length === 0) return;

      const optionPromises = preference.optionIds.map(async (optionId) => {
        await this.insertUserPreferenceOption(
          tx,
          userPreferenceId,
          optionId,
          PreferenceTarget.SELF,
        );
      });

      await Promise.all(optionPromises);
    });

    await Promise.all(preferencePromises);
  }

  async updatePartnerPreferences(
    userId: string,
    profileId: string,
    data: PartnerPreferencesSave,
  ) {
    return await this.db.transaction(async (tx) => {
      const userPreferenceId = await this.getUserPreferenceId(tx, userId);
      await this.deleteExistingPartnerOptions(tx, userPreferenceId);
      await this.deleteExistingAdditionalPreferences(tx, profileId);

      if (data.preferences.length === 0) return;
      await this.insertPartnerPreferenceOptions(
        tx,
        userPreferenceId,
        data.preferences,
      );
      await this.insertAdditionalPartnerOptions(tx, profileId, data.additional);
    });
  }

  private async deleteExistingPartnerOptions(
    tx: Transaction,
    userPreferenceId: string,
  ): Promise<void> {
    await tx
      .delete(schema.userPreferenceOptions)
      .where(
        and(
          eq(schema.userPreferenceOptions.userPreferenceId, userPreferenceId),
          eq(
            schema.userPreferenceOptions.preferenceTarget,
            PreferenceTarget.PARTNER,
          ),
        ),
      );
  }

  private async insertPartnerPreferenceOptions(
    tx: Transaction,
    userPreferenceId: string,
    data: PreferenceData[],
  ): Promise<void> {
    const preferencePromises = data.map(async (preference) => {
      const preferenceType = await tx.query.preferenceTypes.findFirst({
        where: eq(schema.preferenceTypes.name, preference.typeName),
      });

      if (!preferenceType) {
        throw new Error(
          `선호도 타입을 찾을 수 없습니다: ${preference.typeName}`,
        );
      }

      if (preference.optionIds.length === 0) return;

      const optionPromises = preference.optionIds.map(async (optionId) => {
        await this.insertUserPreferenceOption(
          tx,
          userPreferenceId,
          optionId,
          PreferenceTarget.PARTNER,
        );
      });

      await Promise.all(optionPromises);
    });

    await Promise.all(preferencePromises);
  }

  private async insertAdditionalPartnerOptions(
    tx: Transaction,
    profileId: string,
    additionalPreferences: any,
  ) {
    await tx.insert(schema.additionalPreferences).values({
      id: generateUuidV7(),
      profileId,
      ...additionalPreferences,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async deleteExistingAdditionalPreferences(
    tx: Transaction,
    profileId: string,
  ): Promise<void> {
    await tx
      .delete(schema.additionalPreferences)
      .where(eq(schema.additionalPreferences.profileId, profileId));
  }
}
