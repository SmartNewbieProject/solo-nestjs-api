enum DrinkingOption {
  FREQUENTLY_OK = '자주 마셔도 괜찮음',
  OCCASIONALLY_OK = '가끔 마시는 정도면 좋음',
  RARELY_PREFERRED = '거의 안 마셨으면 좋겠음',
  NEVER_PREFERRED = '전혀 안 마시는 사람이면 좋겠음',
  NO_PREFERENCE = '상관없음',
}

const NEVERMIND = '상관없음';

// value 는 뜨면안되는 값을 필터링하는 값
const DRINKING_COMPATIBILITY = {
  '자주 마셔도 괜찮음': [
    DrinkingOption.NEVER_PREFERRED,
    DrinkingOption.RARELY_PREFERRED,
  ],
  '가끔 마시는 정도면 좋음': [
    DrinkingOption.NEVER_PREFERRED,
    DrinkingOption.RARELY_PREFERRED,
  ],
  '거의 안 마셨으면 좋겠음': [
    DrinkingOption.OCCASIONALLY_OK,
    DrinkingOption.FREQUENTLY_OK,
  ],
  '전혀 안 마시는 사람이면 좋겠음': [
    DrinkingOption.OCCASIONALLY_OK,
    DrinkingOption.FREQUENTLY_OK,
    NEVERMIND,
  ],
  상관없음: null,
};

const MBTI_COMPATIBILITY = {
  INTJ: ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
  INTP: ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTP', 'ENTP'],
  ENTJ: ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'INTJ'],
  ENTP: ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTP', 'INTP'],
  INFJ: ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
  INFP: ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTJ', 'INTP'],
  ENFJ: ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
  ENFP: ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
  ISTJ: ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ISFJ: ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ESTJ: ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ESFJ: ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ISTP: ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  ISFP: ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  ESTP: ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  ESFP: ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

enum SmokingOption {
  SMOKER = '흡연자도 괜찮음',
  NON_SMOKER_PREFERRED = '비흡연자였으면 좋겠음',
  STRICTLY_NON_SMOKER = '반드시 비흡연자였으면 좋겠음',
  NO_PREFERENCE = '상관없음',
}

// value 는 뜨면안되는 값을 필터링하는 값
const SMOKING_COMPATIBILITY = {
  '흡연자도 괜찮음': [
    SmokingOption.NON_SMOKER_PREFERRED,
    SmokingOption.STRICTLY_NON_SMOKER,
  ],
  '비흡연자였으면 좋겠음': [SmokingOption.SMOKER],
  '반드시 비흡연자였으면 좋겠음': [SmokingOption.SMOKER, NEVERMIND],
  상관없음: null,
};

enum TattooOption {
  TATTOO_OK = '문신 있어도 괜찮음',
  SMALL_TATTOO_OK = '작은 문신 정도는 괜찮음',
  NO_TATTOO_PREFERRED = '문신이 없는 사람이었으면 좋겠음',
  NO_PREFERENCE = '상관없음',
}

// value 는 뜨면안되는 값을 필터링하는 값
const TATTOO_COMPATIBILITY = {
  '문신 있어도 괜찮음': [TattooOption.NO_TATTOO_PREFERRED],
  '작은 문신 정도는 괜찮음': [TattooOption.NO_TATTOO_PREFERRED],
  '문신이 없는 사람이었으면 좋겠음': [
    TattooOption.TATTOO_OK,
    TattooOption.SMALL_TATTOO_OK,
    NEVERMIND,
  ],
  상관없음: null,
};

const compabilities = {
  DRINKING: DRINKING_COMPATIBILITY,
  MBTI: MBTI_COMPATIBILITY,
  SMOKING: SMOKING_COMPATIBILITY,
  TATTOO: TATTOO_COMPATIBILITY,
};

export default compabilities;
