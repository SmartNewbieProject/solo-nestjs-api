import { Injectable } from "@nestjs/common";
import ProfileRepository from "../repository/profile.repository";
import { PreferenceSave } from "../dto/profile.dto";
import { NotFoundException } from "@nestjs/common";
import { ProfileDetails } from "@/types/user";

interface PreferenceOption {
  id: string;
  displayName: string;
}

interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
}

export interface UserPreferences extends ProfileDetails {
  preferences: PreferenceTypeGroup[];
}


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

type Preference = {
  typeName: string;
  optionId: string;
  multiple: boolean;
  optionDisplayName: string;
  maximumChoiceCount: number;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getUserProfiles(userId: string): Promise<UserPreferences> {
    const profileDetails = await this.profileRepository.getProfileDetails(userId);
    const userPreferenceOptions = await this.profileRepository.getUserPreferenceOptions(userId);
    const preferencesByType = new Map<string, PreferenceTypeGroup>();

    if (!profileDetails) {
      throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
    }

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
    
    return {
      ...profileDetails,
      preferences: Array.from(preferencesByType.values())
    };
  } 

  async getAllPreferences() {
    const preferences = await this.profileRepository.getAllPreferences();
    const list: PreferenceSet[] = [];
    const map = this.convertMap(preferences);

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

  async updatePreferences(userId: string, preferenceSave: PreferenceSave) {
    return await this.profileRepository.updatePreferences(userId, preferenceSave.data);
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

  private findOne( typeName: string, preferences: Preference[]) {
    return preferences.find(p => p.typeName === typeName) as Preference;
  }

}
