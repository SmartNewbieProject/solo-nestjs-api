import { Injectable } from "@nestjs/common";
import ProfileRepository from "../repository/profile.repository";
import { PreferenceSave } from "../dto/profile.dto";
import { NotFoundException } from "@nestjs/common";

interface PreferenceOption {
  id: string;
  displayName: string;
}

export interface PreferenceTypeGroup {
  typeName: string;
  selectedOptions: PreferenceOption[];
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

interface ProfileImage {
  id: string;
  order: number;
  isMain: boolean;
  url: string;
}

interface UniversityDetail {
  name: string;
  authentication: boolean;
  department: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  profileImages: ProfileImage[];
  universityDetails: UniversityDetail | null;
  preferences: PreferenceTypeGroup[];
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getUserProfiles(userId: string): Promise<UserProfile> {
    const profileDetails = await this.profileRepository.getProfileDetails(userId);
    
    if (!profileDetails) {
      throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
    }
    
    const userPreferenceOptions = await this.profileRepository.getUserPreferenceOptions(userId);
    const profileImages = this.processProfileImages(profileDetails.profileImages);
    const preferences = this.processPreferences(userPreferenceOptions);
    const universityDetails = this.processUniversityDetails(profileDetails.universityDetail);
    
    return {
      name: profileDetails.name,
      age: profileDetails.age,
      gender: profileDetails.gender,
      profileImages,
      universityDetails,
      preferences
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

  private findOne(typeName: string, preferences: Preference[]) {
    return preferences.find(p => p.typeName === typeName) as Preference;
  }
  
  /**
   * 프로필 이미지 정보를 가공합니다.
   * @param profileImages 프로필 이미지 원본 데이터
   * @returns 가공된 프로필 이미지 정보
   */
  private processProfileImages(profileImages: any[] = []): ProfileImage[] {
    return profileImages.map(profileImage => ({
      id: profileImage.id,
      order: profileImage.imageOrder,
      isMain: profileImage.isMain,
      url: profileImage.image.s3Url,
    }));
  }
  
  /**
   * 사용자 선호도 정보를 가공합니다.
   * @param userPreferenceOptions 사용자 선호도 원본 데이터
   * @returns 가공된 사용자 선호도 정보
   */
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
  
  /**
   * 대학 정보를 가공합니다.
   * @param universityDetail 대학 정보 원본 데이터
   * @returns 가공된 대학 정보
   */
  private processUniversityDetails(universityDetail: any): UniversityDetail | null {
    if (!universityDetail) return null;
    
    return {
      name: universityDetail.universityName,
      authentication: universityDetail.authentication,
      department: universityDetail.department
    };
  }

}
