import { PreferenceKey } from "../domain/preferernce-key";

export interface AttributeWeights {
  weights: {
    [PreferenceKey.DATING_STYLE]: number;    // 연애 스타일
    [PreferenceKey.PERSONALITY]: number;    // 성격
    [PreferenceKey.LIFESTYLE]: number;      // 라이프스타일
    [PreferenceKey.INTEREST]: number;      // 관심사
  };
}
