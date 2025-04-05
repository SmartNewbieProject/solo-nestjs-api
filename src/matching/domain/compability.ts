const DRINKING_COMPATIBILITY = {
  "자주 마셔도 괜찮음": ["자주 마셔도 괜찮음", "가끔 마시는 정도면 좋음", "상관없음"],
  "가끔 마시는 정도면 좋음": ["자주 마셔도 괜찮음", "가끔 마시는 정도면 좋음", "거의 안 마셨으면 좋겠음", "상관없음"],
  "거의 안 마셨으면 좋겠음": ["가끔 마시는 정도면 좋음", "거의 안 마셨으면 좋겠음", "전혀 안 마시는 사람이면 좋겠음", "상관없음"],
  "전혀 안 마시는 사람이면 좋겠음": ["거의 안 마셨으면 좋겠음", "전혀 안 마시는 사람이면 좋겠음", "상관없음"],
  "상관없음": ["자주 마셔도 괜찮음", "가끔 마시는 정도면 좋음", "거의 안 마셨으면 좋겠음", "전혀 안 마시는 사람이면 좋겠음", "상관없음"]
};

const MBTI_COMPATIBILITY = {
  'INTJ': ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
  'INTP': ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTP', 'ENTP'],
  'ENTJ': ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'INTJ'],
  'ENTP': ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTP', 'INTP'],
  'INFJ': ['ENFP', 'ENTP', 'INFJ', 'INFP', 'INTJ', 'ENTJ'],
  'INFP': ['ENFJ', 'ENTJ', 'INFJ', 'INFP', 'INTJ', 'INTP'],
  'ENFJ': ['INFP', 'INTP', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
  'ENFP': ['INFJ', 'INTJ', 'ENFJ', 'ENFP', 'ENTJ', 'ENTP'],
  'ISTJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  'ESTJ': ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  'ESFJ': ['ISFP', 'ISTP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  'ISTP': ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  'ISFP': ['ESFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  'ESTP': ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  'ESFP': ['ISFJ', 'ISTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
};


const compabilities = {
  DRINKING: DRINKING_COMPATIBILITY,
  MBTI: MBTI_COMPATIBILITY,
};

export default compabilities;
