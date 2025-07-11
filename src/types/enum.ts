export enum PersonalityType {
  OUTGOING = 'OUTGOING', // 활발한 성격
  QUIET = 'QUIET', // 조용한 성격
  CARING = 'CARING', // 배려심 많은 사람
  LEADER = 'LEADER', // 리더십 있는 사람
  HUMOROUS = 'HUMOROUS', // 유머 감각 있는 사람
  EMOTIONAL = 'EMOTIONAL', // 감성적인 사람
  ADVENTUROUS = 'ADVENTUROUS', // 모험을 즐기는 사람
  PLANNER = 'PLANNER', // 계획적인 스타일
  SPONTANEOUS = 'SPONTANEOUS', // 즉흥적인 스타일
}

export enum DatingStyle {
  PROACTIVE = 'PROACTIVE', // 적극적인 스타일
  AFFECTIONATE = 'AFFECTIONATE', // 다정다감한 스타일
  FRIENDLY = 'FRIENDLY', // 친구처럼 지나는 스타일
  TSUNDERE = 'TSUNDERE', // 츠데레 스타일
  ATTENTIVE = 'ATTENTIVE', // 상대방을 많이 챙기는 스타일
  RESERVED_BUT_CARING = 'RESERVED_BUT_CARING', // 표현을 잘 안 하지만 속은 다정한 스타일
  FREE_SPIRITED = 'FREE_SPIRITED', // 자유로운 연애를 선호하는 스타일
  FREQUENT_CONTACT = 'FREQUENT_CONTACT', // 자주 연락하는 걸 선호하는 스타일
}

export enum LifestyleType {
  MORNING_PERSON = 'MORNING_PERSON', // 아침형 인간
  NIGHT_PERSON = 'NIGHT_PERSON', // 밤형 인간
  HOMEBODY = 'HOMEBODY', // 집순이 / 집돌이
  TRAVELER = 'TRAVELER', // 여행을 자주 다니는 편
  ACTIVE = 'ACTIVE', // 운동을 즐기는 편
  GAMER = 'GAMER', // 게임을 자주 하는 편
  CAFE_LOVER = 'CAFE_LOVER', // 카페에서 노는 걸 좋아함
  ACTIVITY_LOVER = 'ACTIVITY_LOVER', // 액티비티 활동을 좋아함
}

export enum DrinkingPreference {
  FREQUENTLY_OK = 'FREQUENTLY_OK', // 자주 마셔도 괴찮음
  OCCASIONALLY_OK = 'OCCASIONALLY_OK', // 가끔 마시는 정도면 좋음
  RARELY_PREFERRED = 'RARELY_PREFERRED', // 거의 안 마셨으면 좋겠음
  NON_DRINKER_PREFERRED = 'NON_DRINKER_PREFERRED', // 전혀 안 마시는 사람이면 좋겠음
  NO_PREFERENCE = 'NO_PREFERENCE', // 상관없음
}

export enum SmokingPreference {
  SMOKER_OK = 'SMOKER_OK', // 흡연자도 괴찮음
  NON_SMOKER_PREFERRED = 'NON_SMOKER_PREFERRED', // 비흡연자였으면 좋겠음
  STRICTLY_NON_SMOKER = 'STRICTLY_NON_SMOKER', // 반드시 비흡연자였으면 좋겠음
  NO_PREFERENCE = 'NO_PREFERENCE', // 상관없음
}

export enum TattooPreference {
  TATTOO_OK = 'TATTOO_OK', // 문신 있어도 괴찮음
  SMALL_TATTOO_OK = 'SMALL_TATTOO_OK', // 작은 문신 정도는 괴찮음
  NO_TATTOO_PREFERRED = 'NO_TATTOO_PREFERRED', // 문신이 없는 사람이었으면 좋겠음
  NO_PREFERENCE = 'NO_PREFERENCE', // 상관없음
}

export enum InterestType {
  MOVIES = 'MOVIES', // 영화
  MUSIC = 'MUSIC', // 음악
  READING = 'READING', // 독서
  GAMING = 'GAMING', // 게임
  SPORTS = 'SPORTS', // 운동
  COOKING = 'COOKING', // 요리
  TRAVEL = 'TRAVEL', // 여행
  PHOTOGRAPHY = 'PHOTOGRAPHY', // 사진
  FASHION = 'FASHION', // 패션
  CAFE = 'CAFE', // 카페
  PERFORMANCE = 'PERFORMANCE', // 공연
  EXHIBITION = 'EXHIBITION', // 전시
  PETS = 'PETS', // 반려동물
  HIKING = 'HIKING', // 등산
  CYCLING = 'CYCLING', // 자전거
}

export enum MbtiType {
  INTJ = 'INTJ',
  INTP = 'INTP',
  ENTJ = 'ENTJ',
  ENTP = 'ENTP',
  INFJ = 'INFJ',
  INFP = 'INFP',
  ENFJ = 'ENFJ',
  ENFP = 'ENFP',
  ISTJ = 'ISTJ',
  ISFJ = 'ISFJ',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ISTP = 'ISTP',
  ISFP = 'ISFP',
  ESTP = 'ESTP',
  ESFP = 'ESFP',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

// 선호 나이대
export enum AgePreference {
  OLDER = 'OLDER', // 연상
  YOUNGER = 'YOUNGER', // 연하
  SAME_AGE = 'SAME_AGE', // 동갑
  NO_PREFERENCE = 'NO_PREFERENCE', // 상관없음
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ReportStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  RESOLVED = 'resolved',
}

export enum GemTransactionType {
  CHARGE = 'CHARGE',
  CONSUME = 'CONSUME',
}

export enum GemReferenceType {
  PAYMENT = 'PAYMENT',
  PROFILE_OPEN = 'PROFILE_OPEN',
  LIKE_MESSAGE = 'LIKE_MESSAGE',
  CHAT = 'CHAT',
  FILTER = 'FILTER',
}

export enum FeatureType {
  PROFILE_OPEN = 'PROFILE_OPEN',
  LIKE_MESSAGE = 'LIKE_MESSAGE',
  CHAT_START = 'CHAT_START',
  PREMIUM_FILTER = 'PREMIUM_FILTER',
}
