-- 선호도 타입 데이터 삽입
INSERT INTO preference_types (id, code, name, multi_select, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'PERSONALITY', '성격 유형', true, NOW(), NOW()),
  (gen_random_uuid(), 'DATING_STYLE', '연애 스타일', true, NOW(), NOW()),
  (gen_random_uuid(), 'LIFESTYLE', '라이프스타일', true, NOW(), NOW()),
  (gen_random_uuid(), 'DRINKING', '음주 선호도', false, NOW(), NOW()),
  (gen_random_uuid(), 'SMOKING', '흡연 선호도', false, NOW(), NOW()),
  (gen_random_uuid(), 'TATTOO', '문신 선호도', false, NOW(), NOW()),
  (gen_random_uuid(), 'INTEREST', '관심사', true, NOW(), NOW()),
  (gen_random_uuid(), 'MBTI', 'MBTI 유형', false, NOW(), NOW()),
  (gen_random_uuid(), 'AGE_PREFERENCE', '선호 나이대', false, NOW(), NOW());

-- 성격 유형 옵션
WITH personality_type AS (SELECT id FROM preference_types WHERE code = 'PERSONALITY')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM personality_type), 'OUTGOING', '활발한 성격', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'QUIET', '조용한 성격', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'CARING', '배려심 많은 사람', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'LEADER', '리더십 있는 사람', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'HUMOROUS', '유머 감각 있는 사람', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'EMOTIONAL', '감성적인 사람', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'ADVENTUROUS', '모험을 즐기는 사람', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'PLANNER', '계획적인 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM personality_type), 'SPONTANEOUS', '즉흥적인 스타일', NOW(), NOW());

-- 연애 스타일 옵션
WITH dating_style AS (SELECT id FROM preference_types WHERE code = 'DATING_STYLE')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM dating_style), 'PROACTIVE', '적극적인 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'AFFECTIONATE', '다정다감한 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'FRIENDLY', '친구처럼 지내는 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'TSUNDERE', '츤데레 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'ATTENTIVE', '상대방을 많이 챙기는 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'RESERVED_BUT_CARING', '표현을 잘 안 하지만 속은 다정한 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'FREE_SPIRITED', '자유로운 연애를 선호하는 스타일', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM dating_style), 'FREQUENT_CONTACT', '자주 연락하는 걸 선호하는 스타일', NOW(), NOW());

-- 라이프스타일 옵션
WITH lifestyle AS (SELECT id FROM preference_types WHERE code = 'LIFESTYLE')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'MORNING_PERSON', '아침형 인간', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'NIGHT_PERSON', '밤형 인간', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'HOMEBODY', '집순이 / 집돌이', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'TRAVELER', '여행을 자주 다니는 편', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'ACTIVE', '운동을 즐기는 편', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'GAMER', '게임을 자주 하는 편', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'CAFE_LOVER', '카페에서 노는 걸 좋아함', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM lifestyle), 'ACTIVITY_LOVER', '액티비티 활동을 좋아함', NOW(), NOW());

-- 음주 선호도 옵션
WITH drinking AS (SELECT id FROM preference_types WHERE code = 'DRINKING')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM drinking), 'FREQUENTLY_OK', '자주 마셔도 괜찮음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM drinking), 'OCCASIONALLY_OK', '가끔 마시는 정도면 좋음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM drinking), 'RARELY_PREFERRED', '거의 안 마셨으면 좋겠음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM drinking), 'NON_DRINKER_PREFERRED', '전혀 안 마시는 사람이면 좋겠음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM drinking), 'NO_PREFERENCE', '상관없음', NOW(), NOW());

-- 흡연 선호도 옵션
WITH smoking AS (SELECT id FROM preference_types WHERE code = 'SMOKING')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM smoking), 'SMOKER_OK', '흡연자도 괜찮음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM smoking), 'NON_SMOKER_PREFERRED', '비흡연자였으면 좋겠음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM smoking), 'STRICTLY_NON_SMOKER', '반드시 비흡연자였으면 좋겠음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM smoking), 'NO_PREFERENCE', '상관없음', NOW(), NOW());

-- 문신 선호도 옵션
WITH tattoo AS (SELECT id FROM preference_types WHERE code = 'TATTOO')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM tattoo), 'TATTOO_OK', '문신 있어도 괜찮음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM tattoo), 'SMALL_TATTOO_OK', '작은 문신 정도는 괜찮음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM tattoo), 'NO_TATTOO_PREFERRED', '문신이 없는 사람이었으면 좋겠음', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM tattoo), 'NO_PREFERENCE', '상관없음', NOW(), NOW());

-- 관심사 옵션
WITH interest AS (SELECT id FROM preference_types WHERE code = 'INTEREST')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at, image_url)
VALUES
  (gen_random_uuid(), (SELECT id FROM interest), 'MOVIES', '영화', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/movie.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'MUSIC', '음악', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/music.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'READING', '독서', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/reading.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'GAMING', '게임', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/gaming.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'SPORTS', '운동', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/exercise.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'COOKING', '요리', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cooking.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'TRAVEL', '여행', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/travel.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'PHOTOGRAPHY', '사진', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/capture.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'FASHION', '패션', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/fashion.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'CAFE', '카페', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cafe.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'PERFORMANCE', '공연', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/festival.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'EXHIBITION', '전시', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/pictures.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'PETS', '반려동물', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/pet.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'HIKING', '등산', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/hiking.png'),
  (gen_random_uuid(), (SELECT id FROM interest), 'CYCLING', '자전거', NOW(), NOW(), 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/sports.png');

-- MBTI 유형 옵션
WITH mbti AS (SELECT id FROM preference_types WHERE code = 'MBTI')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM mbti), 'INTJ', 'INTJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'INTP', 'INTP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ENTJ', 'ENTJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ENTP', 'ENTP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'INFJ', 'INFJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'INFP', 'INFP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ENFJ', 'ENFJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ENFP', 'ENFP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ISTJ', 'ISTJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ISFJ', 'ISFJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ESTJ', 'ESTJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ESFJ', 'ESFJ', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ISTP', 'ISTP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ISFP', 'ISFP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ESTP', 'ESTP', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM mbti), 'ESFP', 'ESFP', NOW(), NOW());

-- 선호 나이대 옵션
WITH age_preference AS (SELECT id FROM preference_types WHERE code = 'AGE_PREFERENCE')
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT id FROM age_preference), 'OLDER', '연상', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM age_preference), 'YOUNGER', '연하', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM age_preference), 'SAME_AGE', '동갑', NOW(), NOW()),
  (gen_random_uuid(), (SELECT id FROM age_preference), 'NO_PREFERENCE', '상관없음', NOW(), NOW());
