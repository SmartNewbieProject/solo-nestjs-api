import { Injectable } from "@nestjs/common";
import ProfileRepository from "../repository/profile.repository";

type Option = {
  id: string;
  displayName: string;
}

type PreferenceSet = {
  typeName: string;
  options: Option[];
  multiple: boolean;
  maximumChoiceCount: number;
}

type Preference = {
  typeName: string;
  optionDisplayName: string; 
  optionId: string;
  multiple: boolean;
  maximumChoiceCount: number;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

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
