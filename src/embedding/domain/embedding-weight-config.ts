import { AttributeWeights } from "../interfaces/attribute-weight.interface";
import { PreferenceKey } from "./preferernce-key";

export class EmbeddingWeightConfig {

  static getDefaultWeights(): AttributeWeights {
    return {
      // TODO: 현재 개인성격과 라이프스타일은 반영이 안됨.. 추후 반영 필요
      weights: {
        [PreferenceKey.DATING_STYLE]: 0.65,    // 연애스타일 40%
        [PreferenceKey.PERSONALITY]: 0.30,    // 성격 35%
        [PreferenceKey.LIFESTYLE]: 0.10,       // 라이프스타일 15%
        [PreferenceKey.INTEREST]: 0.35,       // 관심사 10%
      },
    };
  }
  
}