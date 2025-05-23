export enum PreferenceKey {
  DRINKING = 'DRINKING',
  SMOKING = 'SMOKING',
  TATTOO = 'TATTOO',
  MBTI = 'MBTI',
  AGE_PREFERENCE = 'AGE_PREFERENCE',
  MILITARY_STATUS_MALE = 'MILITARY_STATUS_MALE',
  MILITARY_PREFERENCE_FEMALE = 'MILITARY_PREFERENCE_FEMALE',
  LIFESTYLE = 'LIFESTYLE',
  PERSONALITY = 'PERSONALITY',
  DATING_STYLE = 'DATING_STYLE',
  INTEREST = 'INTEREST',
}

export function getPreferenceNameByKey(key: PreferenceKey): string {
  switch (key) {
    case PreferenceKey.DRINKING:
      return '음주 선호도';
    case PreferenceKey.SMOKING:
      return '흡연 선호도';
    case PreferenceKey.TATTOO:
      return '문신 선호도';
    case PreferenceKey.MBTI:
      return 'MBTI 유형';
    case PreferenceKey.AGE_PREFERENCE:
      return '선호 나이대';
    case PreferenceKey.MILITARY_STATUS_MALE:
      return '군필 여부';
    case PreferenceKey.MILITARY_PREFERENCE_FEMALE:
      return '군필 여부 선호도';
    case PreferenceKey.LIFESTYLE:
      return '라이프스타일';
    case PreferenceKey.PERSONALITY:
      return '성격 유형';
    case PreferenceKey.DATING_STYLE:
      return '연애 스타일';
    case PreferenceKey.INTEREST:
      return '관심사';
    default:
      return '';
  }
}
