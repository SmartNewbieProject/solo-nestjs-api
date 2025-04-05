import { UserPreferenceSummary } from "@/types/match";
import { MatchingWeights } from "../services/matching.service";

const MBTI_COMPATIBILITY: Record<string, Record<string, number>> = {
    'INFP': { 'ENFJ': 0.9, 'ENTJ': 0.8, 'INFP': 0.6, 'INFJ': 0.7, 'ENFP': 0.7, 'INTJ': 0.7, 'ENTP': 0.7, 'INTP': 0.6 },
    'ENFP': { 'INFJ': 0.9, 'INTJ': 0.8, 'ENFP': 0.6, 'ENFJ': 0.7, 'INFP': 0.7, 'ENTJ': 0.7, 'INTP': 0.7, 'ENTP': 0.6 },
    'INFJ': { 'ENFP': 0.9, 'ENTP': 0.8, 'INFJ': 0.6, 'INFP': 0.7, 'ENFJ': 0.7, 'INTJ': 0.7, 'ENTJ': 0.7, 'INTP': 0.6 },
    'ENFJ': { 'INFP': 0.9, 'ISFP': 0.8, 'ENFJ': 0.6, 'ENFP': 0.7, 'INFJ': 0.7, 'ESFP': 0.7, 'ISFJ': 0.7, 'ESFJ': 0.6 },
    'INTJ': { 'ENFP': 0.9, 'ENTP': 0.8, 'INTJ': 0.6, 'INFJ': 0.7, 'INTP': 0.7, 'ENTJ': 0.7, 'INFP': 0.7, 'ENFJ': 0.6 },
    'ENTJ': { 'INFP': 0.9, 'INTP': 0.8, 'ENTJ': 0.6, 'INTJ': 0.7, 'ENFJ': 0.7, 'ENTP': 0.7, 'INFJ': 0.7, 'ENFP': 0.6 },
    'INTP': { 'ENTJ': 0.9, 'ENFJ': 0.8, 'INTP': 0.6, 'INTJ': 0.7, 'ENTP': 0.7, 'INFJ': 0.7, 'INFP': 0.7, 'ENFP': 0.6 },
    'ENTP': { 'INFJ': 0.9, 'INTJ': 0.8, 'ENTP': 0.6, 'INTP': 0.7, 'ENFP': 0.7, 'ENTJ': 0.7, 'INFP': 0.7, 'ENFJ': 0.6 },
    'ISFP': { 'ESFJ': 0.9, 'ESTJ': 0.8, 'ISFP': 0.6, 'ISFJ': 0.7, 'ESFP': 0.7, 'ISTJ': 0.7, 'ESTP': 0.7, 'ISTP': 0.6 },
    'ESFP': { 'ISFJ': 0.9, 'ISTJ': 0.8, 'ESFP': 0.6, 'ESFJ': 0.7, 'ISFP': 0.7, 'ESTJ': 0.7, 'ISTP': 0.7, 'ESTP': 0.6 },
    'ISFJ': { 'ESFP': 0.9, 'ESTP': 0.8, 'ISFJ': 0.6, 'ISFP': 0.7, 'ESFJ': 0.7, 'ISTJ': 0.7, 'ESTJ': 0.7, 'ISTP': 0.6 },
    'ESFJ': { 'ISFP': 0.9, 'ISTP': 0.8, 'ESFJ': 0.6, 'ESFP': 0.7, 'ISFJ': 0.7, 'ESTP': 0.7, 'ISTJ': 0.7, 'ESTJ': 0.6 },
    'ISTP': { 'ESFJ': 0.9, 'ENFJ': 0.8, 'ISTP': 0.6, 'ISTJ': 0.7, 'ESTP': 0.7, 'ISFJ': 0.7, 'ISFP': 0.7, 'ESFP': 0.6 },
    'ESTP': { 'ISFJ': 0.9, 'INFJ': 0.8, 'ESTP': 0.6, 'ISTJ': 0.7, 'ISTP': 0.7, 'ESTJ': 0.7, 'ISFP': 0.7, 'ESFJ': 0.6 },
    'ISTJ': { 'ESFP': 0.9, 'ENFP': 0.8, 'ISTJ': 0.6, 'ISFJ': 0.7, 'ESTJ': 0.7, 'ISTP': 0.7, 'ESTP': 0.7, 'ESFJ': 0.6 },
    'ESTJ': { 'ISFP': 0.9, 'INFP': 0.8, 'ESTJ': 0.6, 'ISTJ': 0.7, 'ESFJ': 0.7, 'ESTP': 0.7, 'ISFJ': 0.7, 'ESFP': 0.6 },
  };

const PREFERENCE_KEYS = [
  '음주 선호도',
  '흡연 선호도',
  '문신 선호도',
  'MBTI 유형',
  '선호 나이대',
  '연애 스타일',
  '성격 유형',
  '라이프스타일',
  '관심사',
];

const DEFAULT_WEIGHTS: MatchingWeights = {
    age: 0.15,
    interests: 0.2,
    personalities: 0.15,
    lifestyles: 0.15,
    mbti: 0.15,
    embedding: 0.1,
    tattoo: 0.25,
    drinking: 0.25,
    smoking: 0.25,
};

const matchingPreferenceWeighter = {
  consts: {
    MBTI_COMPATIBILITY,
    PREFERENCE_KEYS,
  },
  getWeights(weights?: Partial<MatchingWeights>): MatchingWeights {
    return {
      ...DEFAULT_WEIGHTS,
      ...(weights || {}),
    };
  },
  score: {
    total(user: UserPreferenceSummary, candidate: UserPreferenceSummary, similarity: number) {
      return {
        age: this.age(user.age, candidate.age),
        interests: this.interests(user.interests, candidate.interests),
        personalities: this.personalities(user.personalities, candidate.personalities),
        lifestyles: this.lifestyles(user.lifestyles, candidate.lifestyles),
        mbti: this.mbti(user.mbti, candidate.mbti),
        embedding: this.embedding(0),
        tattoo: this.tattoo(user.tattoo, candidate.tattoo),
        drinking: this.drinking(user.drinking, candidate.drinking),
        smoking: this.smoking(user.smoking, candidate.smoking),
      };
    },

    age(userAge: number, candidateAge: number): number {
      const ageDiff = Math.abs(userAge - candidateAge);
      if (ageDiff === 0) return 1.0;
      if (ageDiff <= 2) return 0.7;
      if (ageDiff <= 5) return 0.4;
      return 0.1;
    },
    interests(userInterests: string[], candidateInterests: string[]): number {
      if (!userInterests.length || !candidateInterests.length) return 0.5;
      
      // 자카드 유사도 계산 (교집합 / 합집합)
      const intersection = userInterests.filter(id => candidateInterests.includes(id));
      const union = [...new Set([...userInterests, ...candidateInterests])];
      
      return intersection.length / union.length;
    },
    personalities(userPersonalities: string[], candidatePersonalities: string[]): number {
      if (!userPersonalities.length || !candidatePersonalities.length) return 0.5;
      
      // 자카드 유사도 계산 (교집합 / 합집합)
      const intersection = userPersonalities.filter(id => candidatePersonalities.includes(id));
      const union = [...new Set([...userPersonalities, ...candidatePersonalities])];
      
      return intersection.length / union.length;
    },
    lifestyles(userLifestyles: string[], candidateLifestyles: string[]): number {
      if (!userLifestyles.length || !candidateLifestyles.length) return 0.5;
      
      // 자카드 유사도 계산 (교집합 / 합집합)
      const intersection = userLifestyles.filter(id => candidateLifestyles.includes(id));
      const union = [...new Set([...userLifestyles, ...candidateLifestyles])];
      
      return intersection.length / union.length;
    },
    mbti(userMbti: string | undefined, candidateMbti: string | undefined): number {
      if (!userMbti || !candidateMbti) return 0.5;
      
      return MBTI_COMPATIBILITY[userMbti][candidateMbti] || 0.5;
    },
    embedding(similarity: number): number {
      return similarity;
    },
    tattoo(userTattoo: string | undefined, candidateTattoo: string | undefined): number {
      if (!userTattoo || !candidateTattoo) return 0.5;
      
      return userTattoo === candidateTattoo ? 1.0 : 0.3;
    },
    drinking(userDrinking: string | undefined, candidateDrinking: string | undefined): number {
      if (!userDrinking || !candidateDrinking) return 0.5;
      
      return userDrinking === candidateDrinking ? 1.0 : 0.3;
    },
    smoking(userSmoking: string | undefined, candidateSmoking: string | undefined): number {
      if (!userSmoking || !candidateSmoking) return .5;
      return userSmoking === candidateSmoking ? 1.0 : 0.3;
    },
  }
};

export default matchingPreferenceWeighter;
