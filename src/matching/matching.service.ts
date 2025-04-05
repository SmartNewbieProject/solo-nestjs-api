import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@/database/drizzle.service';
import { ProfileEmbeddingService } from '@/embedding/profile-embedding.service';
import { QdrantService } from '@/qdrant/qdrant.service';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { 
  users, 
  userPreferenceOptions, 
  userPreferences, 
  profiles, 
  preferenceOptions, 
  preferenceTypes 
} from '@/database/schema';

export interface MatchingWeights {
  age: number;
  gender: number;
  interests: number;
  personalities: number;
  lifestyles: number;
  mbti: number;
  embedding: number;
}

export interface MatchingResult {
  userId: string;
  score: number;
  details: {
    ageScore: number;
    genderScore: number;
    interestsScore: number;
    personalitiesScore: number;
    lifestylesScore: number;
    mbtiScore: number;
    embeddingScore: number;
  };
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  
  // 기본 가중치 설정
  private readonly DEFAULT_WEIGHTS: MatchingWeights = {
    age: 0.15,
    gender: 0.1,
    interests: 0.2,
    personalities: 0.15,
    lifestyles: 0.15,
    mbti: 0.15,
    embedding: 0.1,
  };
  
  // MBTI 궁합 점수 (0~1 사이 값, 1이 가장 좋은 궁합)
  private readonly MBTI_COMPATIBILITY: Record<string, Record<string, number>> = {
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

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly profileEmbeddingService: ProfileEmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}

  /**
   * 사용자에게 맞는 매칭 결과를 반환합니다.
   * @param userId 사용자 ID
   * @param limit 결과 제한 수
   * @param weights 가중치 설정 (선택적)
   */
  async findMatches(
    userId: string, 
    limit: number = 10,
    weights?: Partial<MatchingWeights>
  ): Promise<MatchingResult[]> {
    try {
      // 가중치 설정 (기본값 + 사용자 정의 가중치)
      const finalWeights: MatchingWeights = {
        ...this.DEFAULT_WEIGHTS,
        ...(weights || {}),
      };
      
      // 가중치 합이 1이 되도록 정규화
      const weightSum = Object.values(finalWeights).reduce((sum, weight) => sum + weight, 0);
      Object.keys(finalWeights).forEach(key => {
        finalWeights[key as keyof MatchingWeights] /= weightSum;
      });
      
      // 사용자 프로필 정보 가져오기
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        this.logger.warn(`사용자 ${userId}의 프로필 정보를 찾을 수 없습니다.`);
        return [];
      }
      
      // 임베딩 기반 유사 프로필 검색
      const similarProfiles = await this.profileEmbeddingService.findSimilarProfiles(userId, limit * 3);
      
      // 각 후보에 대한 상세 점수 계산
      const matchResults: MatchingResult[] = [];
      
      for (const candidate of similarProfiles) {
        const candidateProfile = await this.getUserProfile(candidate.userId);
        if (!candidateProfile) continue;
        
        // 각 요소별 점수 계산
        const ageScore = this.calculateAgeScore(userProfile.age, candidateProfile.age);
        const genderScore = this.calculateGenderScore(userProfile.gender, candidateProfile.gender);
        const interestsScore = this.calculateInterestsScore(userProfile.interests, candidateProfile.interests);
        const personalitiesScore = this.calculatePersonalitiesScore(userProfile.personalities, candidateProfile.personalities);
        const lifestylesScore = this.calculateLifestylesScore(userProfile.lifestyles, candidateProfile.lifestyles);
        const mbtiScore = this.calculateMbtiScore(userProfile.mbti, candidateProfile.mbti);
        const embeddingScore = candidate.similarity;
        
        // 가중치를 적용한 최종 점수 계산
        const score = 
          ageScore * finalWeights.age +
          genderScore * finalWeights.gender +
          interestsScore * finalWeights.interests +
          personalitiesScore * finalWeights.personalities +
          lifestylesScore * finalWeights.lifestyles +
          mbtiScore * finalWeights.mbti +
          embeddingScore * finalWeights.embedding;
        
        matchResults.push({
          userId: candidate.userId,
          score,
          details: {
            ageScore,
            genderScore,
            interestsScore,
            personalitiesScore,
            lifestylesScore,
            mbtiScore,
            embeddingScore,
          }
        });
      }
      
      // 점수 기준 내림차순 정렬 후 상위 결과 반환
      return matchResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      this.logger.error(`매칭 검색 중 오류 발생: ${error.message}`, error.stack);
      return [];
    }
  }
  
  /**
   * 사용자 프로필 정보를 가져옵니다.
   * @param userId 사용자 ID
   */
  private async getUserProfile(userId: string): Promise<any> {
    const db = this.drizzleService.db;
    
    // 사용자 기본 정보 및 프로필 정보 가져오기
    const userWithProfile = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userWithProfile.length === 0) {
      return null;
    }
    
    const user = userWithProfile[0].users;
    const profile = userWithProfile[0].profiles;
    
    if (!profile) {
      this.logger.warn(`사용자 ${userId}의 프로필 정보가 없습니다.`);
      return null;
    }
    
    // 사용자 선호도 정보 가져오기
    const userPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    
    // 사용자 선호도 옵션 가져오기
    const userPrefOptionsResult = await db
      .select({
        id: userPreferenceOptions.id,
        userPreferenceId: userPreferenceOptions.userPreferenceId,
        preferenceOptionId: userPreferenceOptions.preferenceOptionId,
        preferenceTypeId: preferenceOptions.preferenceTypeId,
        value: preferenceOptions.value,
      })
      .from(userPreferenceOptions)
      .leftJoin(
        preferenceOptions, 
        eq(userPreferenceOptions.preferenceOptionId, preferenceOptions.id)
      )
      .where(
        sql`${userPreferenceOptions.userPreferenceId} IN (
          SELECT ${userPreferences.id} FROM ${userPreferences} 
          WHERE ${userPreferences.userId} = ${userId}
        )`
      );
    
    // 선호도 타입별로 그룹화
    const preferencesByType: Record<string, string[]> = {};
    
    for (const option of userPrefOptionsResult) {
      if (!option.preferenceTypeId) continue;
      
      if (!preferencesByType[option.preferenceTypeId]) {
        preferencesByType[option.preferenceTypeId] = [];
      }
      preferencesByType[option.preferenceTypeId].push(option.preferenceOptionId);
    }
    
    // MBTI 값 찾기
    const mbtiPref = userPrefs.find(p => p.id.includes('mbti'));
    
    // 프로필 정보 구성
    return {
      id: user.id,
      name: user.name,
      age: profile.age,
      gender: profile.gender,
      mbti: mbtiPref ? mbtiPref.distanceMax : null, // MBTI 값은 distanceMax 필드에 저장될 수 있음
      interests: preferencesByType['4cb7f832-9bbf-42d7-bf39-b1f21f8a8095'] || [], // 관심사 타입 ID
      personalities: preferencesByType['1cb7f832-9bbf-42d7-bf39-b1f21f8a8095'] || [], // 성격 타입 ID
      lifestyles: preferencesByType['2cb7f832-9bbf-42d7-bf39-b1f21f8a8095'] || [], // 라이프스타일 타입 ID
      introduction: profile.introduction,
    };
  }
  
  /**
   * 생년월일로부터 나이를 계산합니다.
   * @param birthDate 생년월일
   */
  // 이 함수는 더 이상 필요하지 않습니다. 프로필에 나이가 직접 저장됩니다.
  
  /**
   * 나이 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userAge 사용자 나이
   * @param candidateAge 후보자 나이
   */
  private calculateAgeScore(userAge: number, candidateAge: number): number {
    if (!userAge || !candidateAge) return 0.5;
    
    const ageDiff = Math.abs(userAge - candidateAge);
    
    // 나이 차이가 적을수록 높은 점수
    if (ageDiff === 0) return 1.0;
    if (ageDiff <= 2) return 0.9;
    if (ageDiff <= 5) return 0.7;
    if (ageDiff <= 10) return 0.5;
    return 0.3;
  }
  
  /**
   * 성별 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userGender 사용자 성별
   * @param candidateGender 후보자 성별
   */
  private calculateGenderScore(userGender: string, candidateGender: string): number {
    if (!userGender || !candidateGender) return 0.5;
    
    // 이성일 경우 높은 점수 (기본 설정)
    return userGender !== candidateGender ? 1.0 : 0.3;
  }
  
  /**
   * 관심사 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userInterests 사용자 관심사 ID 배열
   * @param candidateInterests 후보자 관심사 ID 배열
   */
  private calculateInterestsScore(userInterests: string[], candidateInterests: string[]): number {
    if (!userInterests.length || !candidateInterests.length) return 0.5;
    
    // 자카드 유사도 계산 (교집합 / 합집합)
    const intersection = userInterests.filter(id => candidateInterests.includes(id));
    const union = [...new Set([...userInterests, ...candidateInterests])];
    
    return intersection.length / union.length;
  }
  
  /**
   * 성격 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userPersonalities 사용자 성격 ID 배열
   * @param candidatePersonalities 후보자 성격 ID 배열
   */
  private calculatePersonalitiesScore(userPersonalities: string[], candidatePersonalities: string[]): number {
    if (!userPersonalities.length || !candidatePersonalities.length) return 0.5;
    
    // 자카드 유사도 계산 (교집합 / 합집합)
    const intersection = userPersonalities.filter(id => candidatePersonalities.includes(id));
    const union = [...new Set([...userPersonalities, ...candidatePersonalities])];
    
    return intersection.length / union.length;
  }
  
  /**
   * 라이프스타일 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userLifestyles 사용자 라이프스타일 ID 배열
   * @param candidateLifestyles 후보자 라이프스타일 ID 배열
   */
  private calculateLifestylesScore(userLifestyles: string[], candidateLifestyles: string[]): number {
    if (!userLifestyles.length || !candidateLifestyles.length) return 0.5;
    
    // 자카드 유사도 계산 (교집합 / 합집합)
    const intersection = userLifestyles.filter(id => candidateLifestyles.includes(id));
    const union = [...new Set([...userLifestyles, ...candidateLifestyles])];
    
    return intersection.length / union.length;
  }
  
  /**
   * MBTI 궁합 점수를 계산합니다. (0~1 사이 값)
   * @param userMbti 사용자 MBTI
   * @param candidateMbti 후보자 MBTI
   */
  private calculateMbtiScore(userMbti: string, candidateMbti: string): number {
    if (!userMbti || !candidateMbti) return 0.5;
    
    // MBTI 궁합표에서 점수 가져오기
    const compatibilityScore = this.MBTI_COMPATIBILITY[userMbti]?.[candidateMbti];
    
    // 궁합표에 없는 조합은 중간 점수 반환
    return compatibilityScore !== undefined ? compatibilityScore : 0.5;
  }
}
