
import { Injectable } from "@nestjs/common";
import { PreferenceRepository } from "../repository/preference.repository";
import { ProfileService } from "./profile.service";
import { PreferenceOption } from "@/docs/matching.docs";

@Injectable()
export class PreferenceService {
  constructor(
    private readonly preferenceRepository: PreferenceRepository,
    private readonly profileService: ProfileService,
  ) { }

  async getPreferencesByName(typeName: string): Promise<PreferenceOption[]> {
    const results = await this.preferenceRepository.getPreferencesByName(typeName);

    return results.map(result => ({
      id: result.preference_options?.id as string,
      displayName: result.preference_options?.displayName as string,
    }));
  }
}

