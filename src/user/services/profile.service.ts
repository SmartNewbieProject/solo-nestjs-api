import { BadRequestException, Injectable } from "@nestjs/common";
import ProfileRepository from "../repository/profile.repository";
import { PreferenceSave } from "../dto/profile.dto";
import { NotFoundException } from "@nestjs/common";
import { UserProfile, UniversityDetail, ProfileImage, Preference, PreferenceOption, PreferenceTypeGroup } from "@/types/user";
import { Gender } from "@/types/enum";

type Option = {
  id: string;
  displayName: string;
}

export type PreferenceSet = {
  typeName: string;
  options: Option[];
  multiple: boolean;
  maximumChoiceCount: number;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getUserProfiles(userId: string): Promise<UserProfile> {
    const profileDetails = await this.profileRepository.getProfileDetails(userId);
    
    if (!profileDetails) {
      throw new NotFoundException(`사용자 프로필을 찾을 수 없습니다. ${userId}`);
    }

    const userPreferenceOptions = await this.profileRepository.getUserPreferenceOptions(userId);
    const preferences = this.processPreferences(userPreferenceOptions);
    
    return {
      id: userId,
      name: profileDetails.name,
      age: profileDetails.age,
      gender: profileDetails.gender,
      profileImages: profileDetails.profileImages,
      instagramId: profileDetails.instagramId,
      universityDetails: profileDetails.universityDetail,
      preferences
    };
  }
  
  async getProfilesByIds(ids: string[]): Promise<UserProfile[]> {
    const promises = ids.map(id => this.getUserProfiles(id));
    return Promise.all(promises);
  }

  async getAllPreferences(gender: Gender) {
    const preferences = await this.profileRepository.getAllPreferences();
    const list: PreferenceSet[] = [];
    const map = this.convertMap(preferences);

    if (gender === Gender.MALE) {
      map.delete("군필 여부 선호도");
    } 
    if (gender === Gender.FEMALE) {
      map.delete("군필 여부");
    }

    map.forEach((options, typeName) => {
      const { multiple, maximumChoiceCount } = this.findOne(typeName, preferences);

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
    const fns = data.map(async (preference) => {
      const type = await this.profileRepository.getPreferenceTypeByName(preference.typeName);
      return {
        type,
        options: preference.optionIds
      };
    });
    const types = await Promise.all(fns);
    types.forEach(({ type, options }) => {
      if (type?.maximumChoiceCount && type.maximumChoiceCount < options.length) {
        throw new BadRequestException(`[${type.name},최대 개수:${type.maximumChoiceCount}] 선택 가능한 최대 수를 초과했습니다.`);
      }
    })

    await this.profileRepository.updatePreferences(userId, data);
    return this.getUserProfiles(userId);
  }

  async updateInstagramId(userId: string, instagramId: string) {
    return await this.profileRepository.updateInstagramId(userId, instagramId);
  }

  private convertMap(preferences: Preference[]) {
    const map = new Map<string, Option[]>();
    preferences.forEach(({ typeName, optionDisplayName, optionId }) => {
      if (!map.has(typeName)) {
        map.set(typeName, []);
      }
      const exists = map.get(typeName) as Option[];
      map.set(typeName, [...exists, { id: optionId, displayName: optionDisplayName }]);
    });
    return map;
  }

  private findOne(typeName: string, preferences: Preference[]) {
    return preferences.find(p => p.typeName === typeName) as Preference;
  }
  
  private processPreferences(userPreferenceOptions: any[]): PreferenceTypeGroup[] {
    const preferencesByType = new Map<string, PreferenceTypeGroup>();
    
    userPreferenceOptions.forEach(option => {
      if (!preferencesByType.has(option.typeName)) {
        preferencesByType.set(option.typeName, {
          typeName: option.typeName,
          selectedOptions: []
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

}
