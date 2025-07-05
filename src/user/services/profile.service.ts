import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import ProfileRepository from '../repository/profile.repository';
import {
  PartnerPreferencesSave,
  PreferenceSave,
  SelfPreferencesSave,
} from '../dto/profile.dto';
import { Preference, PreferenceTypeGroup, UserProfile } from '@/types/user';
import { Gender } from '@/types/enum';
import { PreferenceTarget } from '@database/schema';

type Option = {
  id: string;
  displayName: string;
};

export type PreferenceSet = {
  typeName: string;
  options: Option[];
  multiple: boolean;
  maximumChoiceCount: number;
};

type PreferenceTypeWithOptions = {
  type: {
    id: string;
    name: string;
    maximumChoiceCount: number | null;
  } | null;
  options: string[];
};

type UserPreferenceOption = {
  optionId: string;
  optionDisplayName: string;
  typeName: string;
};

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly profileRepository: ProfileRepository) {}

  async getUserProfiles(
    userId: string,
    sensitive: boolean = true,
  ): Promise<UserProfile> {
    const profileDetails =
      await this.profileRepository.getProfileDetails(userId);

    if (!profileDetails) {
      throw new NotFoundException(
        `사용자 프로필을 찾을 수 없습니다. ${userId}`,
      );
    }

    const userPreferenceOptions =
      await this.profileRepository.getUserPreferenceOptions(
        userId,
        PreferenceTarget.PARTNER,
      );

    const characteristicsOptions =
      await this.profileRepository.getUserPreferenceOptions(
        userId,
        PreferenceTarget.SELF,
      );

    const preferences = this.processPreferences(userPreferenceOptions);
    const characteristics = this.processPreferences(characteristicsOptions);

    return {
      id: userId,
      mbti: profileDetails.mbti,
      name: profileDetails.name,
      age: profileDetails.age,
      gender: profileDetails.gender,
      rank: sensitive ? null : profileDetails.rank,
      profileImages: profileDetails.profileImages,
      instagramId: profileDetails.instagramId,
      universityDetails: profileDetails.universityDetail,
      preferences,
      characteristics,
    };
  }

  async getProfilesByIds(ids: string[]): Promise<UserProfile[]> {
    const promises = ids.map((id) => this.getUserProfiles(id));
    return Promise.all(promises);
  }

  async getPreferences(gender: Gender, target: PreferenceTarget) {
    const preferences = await this.profileRepository.getPreferences(target);
    const list: PreferenceSet[] = [];
    const map = this.convertFilteredOptions(
      this.convertMap(preferences),
      target,
    );

    this.logger.log(map);

    if (gender === Gender.MALE) {
      map.delete('군필 여부 선호도');
    }

    if (gender === Gender.FEMALE || target === PreferenceTarget.PARTNER) {
      map.delete('군필 여부');
    }

    map.forEach((options, typeName) => {
      const { multiple, maximumChoiceCount } = this.findOne(
        typeName,
        preferences,
      );

      list.push({
        typeName,
        options,
        multiple,
        maximumChoiceCount,
      });
    });

    return list;
  }

  async updatePreferences(userId: string, { data }: PreferenceSave) {
    await this.validatePreferenceData(data);
    await this.profileRepository.updatePreferences(userId, data);
    return this.getUserProfiles(userId, false);
  }

  async updateInstagramId(userId: string, instagramId: string) {
    return this.profileRepository.updateInstagramId(userId, instagramId);
  }

  private convertFilteredOptions(
    options: Map<string, Option[]>,
    preferenceTarget: PreferenceTarget,
  ) {
    const selfFilteredItems = [
      '안마시면 좋겠음',
      '가끔마시면 좋겠음',
      '적당히 마시면 좋겠음',
      '마셔도 괜찮음',
      '자주 마셔도 괜찮음',
      '문신 없음',
      '상관 없음',
    ];
    const partnerFilteredItems = [
      '전혀 안마시지 않음',
      '거의 못마심',
      '적당히 마심',
      '자주 마심',
      '매우 즐겨 마심',
      '전자담배',
      '작은 문신',
    ];

    const tattoos = options.get('문신 선호도') as Option[];
    const smokings = options.get('흡연 선호도') as Option[];
    const drinkings = options.get('음주 선호도') as Option[];

    if (preferenceTarget === PreferenceTarget.SELF) {
      const filter = (options: Option[]) =>
        options.filter((o) => !selfFilteredItems.includes(o.displayName));
      options.set('음주 선호도', filter(drinkings));
      options.set('흡연 선호도', filter(smokings));
      options.set('문신 선호도', filter(tattoos));
    } else {
      const filter = (options: Option[]) =>
        options.filter((o) => !partnerFilteredItems.includes(o.displayName));
      options.set('음주 선호도', filter(drinkings));
      options.set('흡연 선호도', filter(smokings));
      options.set('문신 선호도', filter(tattoos));
    }

    return options;
  }

  private convertMap(preferences: Preference[]) {
    const map = new Map<string, Option[]>();
    preferences.forEach(({ typeName, optionDisplayName, optionId }) => {
      if (!map.has(typeName)) {
        map.set(typeName, []);
      }
      const exists = map.get(typeName) as Option[];
      map.set(typeName, [
        ...exists,
        { id: optionId, displayName: optionDisplayName },
      ]);
    });
    return map;
  }

  private findOne(typeName: string, preferences: Preference[]) {
    return preferences.find((p) => p.typeName === typeName) as Preference;
  }

  private async validatePreferenceData(
    data: { typeName: string; optionIds: string[] }[],
  ): Promise<PreferenceTypeWithOptions[]> {
    const fns = data.map(async (preference) => {
      const type = await this.profileRepository.getPreferenceTypeByName(
        preference.typeName,
      );
      return {
        type: type
          ? {
              id: type.id,
              name: type.name,
              maximumChoiceCount: type.maximumChoiceCount,
            }
          : null,
        options: preference.optionIds,
      };
    });

    const types = await Promise.all(fns);

    types.forEach(({ type, options }) => {
      if (
        type?.maximumChoiceCount &&
        type.maximumChoiceCount < options.length
      ) {
        throw new BadRequestException(
          `[${type.name},최대 개수:${type.maximumChoiceCount}] 선택 가능한 최대 수를 초과했습니다.`,
        );
      }
    });

    this.logger.debug({ types });
    return types;
  }

  private processPreferences(
    userPreferenceOptions: UserPreferenceOption[],
  ): PreferenceTypeGroup[] {
    const preferencesByType = new Map<string, PreferenceTypeGroup>();

    userPreferenceOptions.forEach((option) => {
      if (!preferencesByType.has(option.typeName)) {
        preferencesByType.set(option.typeName, {
          typeName: option.typeName,
          selectedOptions: [],
        });
      }

      const typeData = preferencesByType.get(option.typeName);
      if (typeData) {
        typeData.selectedOptions.push({
          id: option.optionId,
          displayName: option.optionDisplayName,
        });
      }
    });

    return Array.from(preferencesByType.values());
  }

  async changeNickname(userId: string, nickname: string) {
    await this.profileRepository.updateNickname(userId, nickname);
    return nickname;
  }

  getMbti(userId: string) {
    return this.profileRepository.getMbti(userId);
  }

  updateMbti(userId: string, mbti: string) {
    return this.profileRepository.updateMbti(userId, mbti);
  }

  async updateSelfPreferences(userId: string, data: SelfPreferencesSave) {
    await this.validatePreferenceData(data.preferences);
    await this.profileRepository.updateSelfPreferences(userId, data);
    return this.getUserProfiles(userId, false);
  }

  async getSelfPreferences(userId: string) {
    const userPreferenceOptions =
      await this.profileRepository.getUserSelfPreferenceOptions(userId);
    return this.processPreferences(userPreferenceOptions);
  }

  async updatePartnerPreferences(userId: string, data: PartnerPreferencesSave) {
    await this.validatePreferenceData(data.preferences);
    const { id: profileId } =
      await this.profileRepository.getProfileSummary(userId);
    await this.profileRepository.updatePartnerPreferences(
      userId,
      profileId,
      data,
    );
    return this.getUserProfiles(userId, false);
  }
}
