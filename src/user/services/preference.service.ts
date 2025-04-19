
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

  async getPreferencesByName(typeName: string) {
    const results = await this.preferenceRepository.getPreferencesByName(typeName);
    const options = results.map(result => ({
      id: result.preference_options?.id as string,
      displayName: result.preference_options?.displayName as string,
      imageUrl: result.preference_options?.imageUrl as string,
    }));
    const typeId = results[0].preference_types?.id as string;

    return { typeId, options };
  }
}

