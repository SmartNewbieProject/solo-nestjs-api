import { Injectable } from "@nestjs/common";
import ProfileRepository from "../repository/profile.repository";

type Option = {
  id: string;
  displayName: string;
}

type PreferenceSet = {
  typeName: string;
  options: Option[];
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getAllPreferences() {
    const map = new Map<string, Option[]>();
    const preferences = await this.profileRepository.getAllPreferences();
    const list: PreferenceSet[] = [];

    preferences.forEach(({ typeName, optionDisplayName, optionId }) => {
      if (!map.has(typeName)) {
        map.set(typeName, []);
      }
      const exists = map.get(typeName) as Option[];
      map.set(typeName, [...exists, { id: optionId, displayName: optionDisplayName }]);
    });

    map.forEach((v, k) => {
      list.push({
        typeName: k,
        options: v,
      })
    });

    return list;
  }
}
