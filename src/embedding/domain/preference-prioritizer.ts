import { Injectable, Logger } from "@nestjs/common";
import { ProfilePrioritizer } from "../interfaces/profile-prioritizer.interface";
import { UserProfile } from "@/types/user";
import { PreferenceParser } from "./preference-parser";
import { getPreferenceNameByKey, PreferenceKey } from "./preferernce-key";
import { AttributeWeights } from "../interfaces/attribute-weight.interface";

export class PreferencePrioritizer implements ProfilePrioritizer {
  private readonly weights: AttributeWeights;
  private readonly logger = new Logger(PreferencePrioritizer.name);

  constructor(weights: AttributeWeights) {
    this.weights = weights;
  }

  extract(profile: UserProfile): string {
    const preferenceParser = new PreferenceParser(profile.preferences);

    const attributes = {
      [PreferenceKey.DATING_STYLE]: preferenceParser.parse(this.getValue(PreferenceKey.DATING_STYLE)),
      [PreferenceKey.PERSONALITY]: preferenceParser.parse(this.getValue(PreferenceKey.PERSONALITY)),
      [PreferenceKey.LIFESTYLE]: preferenceParser.parse(this.getValue(PreferenceKey.LIFESTYLE)),
      [PreferenceKey.INTEREST]: preferenceParser.parse(this.getValue(PreferenceKey.INTEREST)),
    };

    this.logger.debug(attributes);

    const t = Object.entries(attributes)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => {
        const weight = this.weights.weights[key as keyof typeof this.weights.weights];
        const repeatCount = Math.round(weight * 10);

        console.log({ weight, repeatCount });
        console.log(`${key}: ${value!.typeName}: ${value!.concatenated}`);

        return new Array(repeatCount).fill(0)
          .map(() => `${value!.typeName}: ${value!.concatenated}`)
          .flat()
      })
      .flat();

    this.logger.debug(t);

    return t.join('\n');
  }

  private getValue(key: PreferenceKey): string {
    return getPreferenceNameByKey(key);
  }

}
