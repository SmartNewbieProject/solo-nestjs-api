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
  (gen_random_uuid(), (SELECT id FROM interest), 'GAMING', '게임', NOW(), NOW(), 'https://sometimes-resource-- preference_types 데이터 삽입 (중복 시 무시)
INSERT INTO preference_types (id, code, name, multi_select, maximum_choice_count, created_at, updated_at)
SELECT gen_random_uuid(), ''PERSONALITY'', ''성격 유형'', true, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''PERSONALITY'')
UNION ALL
SELECT gen_random_uuid(), ''DATING_STYLE'', ''연애 스타일'', true, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''DATING_STYLE'')
UNION ALL
SELECT gen_random_uuid(), ''LIFESTYLE'', ''라이프스타일'', true, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''LIFESTYLE'')
UNION ALL
SELECT gen_random_uuid(), ''DRINKING'', ''음주 선호도'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''DRINKING'')
UNION ALL
SELECT gen_random_uuid(), ''SMOKING'', ''흡연 선호도'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''SMOKING'')
UNION ALL
SELECT gen_random_uuid(), ''TATTOO'', ''문신 선호도'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''TATTOO'')
UNION ALL
SELECT gen_random_uuid(), ''INTEREST'', ''관심사'', true, 5, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''INTEREST'')
UNION ALL
SELECT gen_random_uuid(), ''MBTI'', ''MBTI 유형'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''MBTI'')
UNION ALL
SELECT gen_random_uuid(), ''AGE_PREFERENCE'', ''선호 나이대'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''AGE_PREFERENCE'')
UNION ALL
SELECT gen_random_uuid(), ''MILITARY_STATUS_MALE'', ''군필 여부'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''MILITARY_STATUS_MALE'')
UNION ALL
SELECT gen_random_uuid(), ''MILITARY_PREFERENCE_FEMALE'', ''군필 여부 선호도'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''MILITARY_PREFERENCE_FEMALE'')
UNION ALL
SELECT gen_random_uuid(), ''personality'', ''성격'', false, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_types WHERE code = ''personality'');

-- preference_options 데이터 삽입 - 성격 유형 (PERSONALITY)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''OUTGOING'', ''활발한 성격'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''OUTGOING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''QUIET'', ''조용한 성격'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''QUIET'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''CARING'', ''배려심 많은 사람'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''CARING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''LEADER'', ''리더십 있는 사람'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''LEADER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''HUMOROUS'', ''유머 감각 있는 사람'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''HUMOROUS'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''EMOTIONAL'', ''감성적인 사람'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''EMOTIONAL'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''ADVENTUROUS'', ''모험을 즐기는 사람'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''ADVENTUROUS'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''PLANNER'', ''계획적인 스타일'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''PLANNER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''PERSONALITY''), ''SPONTANEOUS'', ''즉흥적인 스타일'', 8, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''PERSONALITY'' AND po.value = ''SPONTANEOUS'');

-- preference_options 데이터 삽입 - 성격 (personality)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''quiet'', ''조용한 성격'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''quiet'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''active'', ''활발한 성격'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''active'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''spontaneous'', ''즉흥적인 스타일'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''spontaneous'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''planned'', ''계획적인 스타일'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''planned'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''adventurous'', ''모험을 즐기는 사람'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''adventurous'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''emotional'', ''감성적인 사람'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''emotional'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''caring'', ''배려심 많은 사람'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''caring'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''humorous'', ''유머감각 있는 사람'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''humorous'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''personality''), ''leadership'', ''리더십 있는 사람'', 8, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''personality'' AND po.value = ''leadership'');

-- preference_options 데이터 삽입 - 음주 선호도 (DRINKING)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''PREFER_NONE'', ''안마시면 좋겠음'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''PREFER_NONE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''PREFER_OCCASIONALLY'', ''가끔마시면 좋겠음'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''PREFER_OCCASIONALLY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''PREFER_MODERATE'', ''적당히 마시면 좋겠음'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''PREFER_MODERATE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''OKAY'', ''마셔도 괜찮음'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''OKAY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''FREQUENT_OKAY'', ''자주 마셔도 괜찮음'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''FREQUENT_OKAY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''NEVER'', ''전혀 안마시지 않음'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''NEVER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''RARELY'', ''거의 못마심'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''RARELY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''MODERATE'', ''적당히 마심'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''MODERATE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''FREQUENT'', ''자주 마심'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''FREQUENT'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DRINKING''), ''VERY_FREQUENT'', ''매우 즐겨 마심'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DRINKING'' AND po.value = ''VERY_FREQUENT'');

-- preference_options 데이터 삽입 - 흡연 선호도 (SMOKING)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''SMOKING''), ''NON_SMOKER'', ''비흡연자'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''SMOKING'' AND po.value = ''NON_SMOKER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''SMOKING''), ''E_CIGARETTE'', ''전자담배'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''SMOKING'' AND po.value = ''E_CIGARETTE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''SMOKING''), ''NO_PREFERENCE'', ''상관없음'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''SMOKING'' AND po.value = ''NO_PREFERENCE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''SMOKING''), ''SMOKER'', ''흡연자'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''SMOKING'' AND po.value = ''SMOKER'');

-- preference_options 데이터 삽입 - 문신 선호도 (TATTOO)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''TATTOO''), ''NONE_STRICT'', ''문신 X'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''TATTOO'' AND po.value = ''NONE_STRICT'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''TATTOO''), ''SMALL'', ''작은 문신'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''TATTOO'' AND po.value = ''SMALL'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''TATTOO''), ''NONE'', ''문신 없음'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''TATTOO'' AND po.value = ''NONE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''TATTOO''), ''OKAY'', ''문신 O'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''TATTOO'' AND po.value = ''OKAY'');

-- preference_options 데이터 삽입 - 군필 여부 (MILITARY_STATUS_MALE)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_STATUS_MALE''), ''NOT_SERVED'', ''미필'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_STATUS_MALE'' AND po.value = ''NOT_SERVED'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_STATUS_MALE''), ''EXEMPTED'', ''면제'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_STATUS_MALE'' AND po.value = ''EXEMPTED'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_STATUS_MALE''), ''SERVED'', ''군필'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_STATUS_MALE'' AND po.value = ''SERVED'');

-- preference_options 데이터 삽입 - 군필 여부 선호도 (MILITARY_PREFERENCE_FEMALE)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_PREFERENCE_FEMALE''), ''NOT_SERVED'', ''미필'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_PREFERENCE_FEMALE'' AND po.value = ''NOT_SERVED'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_PREFERENCE_FEMALE''), ''NO_PREFERENCE'', ''상관없음'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_PREFERENCE_FEMALE'' AND po.value = ''NO_PREFERENCE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MILITARY_PREFERENCE_FEMALE''), ''SERVED'', ''군필'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MILITARY_PREFERENCE_FEMALE'' AND po.value = ''SERVED'');

-- preference_options 데이터 삽입 - 연애 스타일 (DATING_STYLE)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''PROACTIVE'', ''적극적인 스타일'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''PROACTIVE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''AFFECTIONATE'', ''다정다감한 스타일'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''AFFECTIONATE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''FRIENDLY'', ''친구처럼 지내는 스타일'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''FRIENDLY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''TSUNDERE'', ''츤데레 스타일'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''TSUNDERE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''ATTENTIVE'', ''상대방을 많이 챙기는 스타일'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''ATTENTIVE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''RESERVED_BUT_CARING'', ''표현을 잘 안 하지만 속은 다정한 스타일'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''RESERVED_BUT_CARING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''FREE_SPIRITED'', ''자유로운 연애를 선호하는 스타일'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''FREE_SPIRITED'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''DATING_STYLE''), ''FREQUENT_CONTACT'', ''자주 연락하는 걸 선호하는 스타일'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''DATING_STYLE'' AND po.value = ''FREQUENT_CONTACT'');

-- preference_options 데이터 삽입 - 라이프스타일 (LIFESTYLE)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''MORNING_PERSON'', ''아침형 인간'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''MORNING_PERSON'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''NIGHT_PERSON'', ''밤형 인간'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''NIGHT_PERSON'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''HOMEBODY'', ''집순이 / 집돌이'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''HOMEBODY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''TRAVELER'', ''여행을 자주 다니는 편'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''TRAVELER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''ACTIVE'', ''운동을 즐기는 편'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''ACTIVE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''GAMER'', ''게임을 자주 하는 편'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''GAMER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''CAFE_LOVER'', ''카페에서 노는 걸 좋아함'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''CAFE_LOVER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''LIFESTYLE''), ''ACTIVITY_LOVER'', ''액티비티 활동을 좋아함'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''LIFESTYLE'' AND po.value = ''ACTIVITY_LOVER'');

-- preference_options 데이터 삽입 - 관심사 (INTEREST)
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''MOVIES'', ''영화'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/movie.png'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''MOVIES'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''MUSIC'', ''음악'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/music.png'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''MUSIC'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''READING'', ''독서'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/reading.png'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''READING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''GAMING'', ''게임'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/gaming.png'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''GAMING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''SPORTS'', ''운동'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/exercise.png'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''SPORTS'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''COOKING'', ''요리'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cooking.png'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''COOKING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''TRAVEL'', ''여행'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/travel.png'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''TRAVEL'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''PHOTOGRAPHY'', ''사진'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/capture.png'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''PHOTOGRAPHY'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''FASHION'', ''패션'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/fashion.png'', 8, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''FASHION'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''CAFE'', ''카페'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cafe.png'', 9, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''CAFE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''PERFORMANCE'', ''공연'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/festival.png'', 10, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''PERFORMANCE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''EXHIBITION'', ''전시'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/pictures.png'', 11, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''EXHIBITION'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''PETS'', ''반려동물'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/pet.png'', 12, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''PETS'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''HIKING'', ''등산'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/hiking.png'', 13, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''HIKING'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''INTEREST''), ''CYCLING'', ''자전거'', ''https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/sports.png'', 14, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''INTEREST'' AND po.value = ''CYCLING'');

-- preference_options 데이터 삽입 - MBTI 유형 (MBTI)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''INTJ'', ''INTJ'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''INTJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''INTP'', ''INTP'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''INTP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ENTJ'', ''ENTJ'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ENTJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ENTP'', ''ENTP'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ENTP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''INFJ'', ''INFJ'', 4, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''INFJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''INFP'', ''INFP'', 5, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''INFP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ENFJ'', ''ENFJ'', 6, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ENFJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ENFP'', ''ENFP'', 7, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ENFP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ISTJ'', ''ISTJ'', 8, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ISTJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ISFJ'', ''ISFJ'', 9, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ISFJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ESTJ'', ''ESTJ'', 10, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ESTJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ESFJ'', ''ESFJ'', 11, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ESFJ'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ISTP'', ''ISTP'', 12, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ISTP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ISFP'', ''ISFP'', 13, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ISFP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ESTP'', ''ESTP'', 14, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ESTP'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''MBTI''), ''ESFP'', ''ESFP'', 15, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''MBTI'' AND po.value = ''ESFP'');

-- preference_options 데이터 삽입 - 선호 나이대 (AGE_PREFERENCE)
INSERT INTO preference_options (id, preference_type_id, value, display_name, "order", deprecated, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''AGE_PREFERENCE''), ''OLDER'', ''연상'', 0, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''AGE_PREFERENCE'' AND po.value = ''OLDER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''AGE_PREFERENCE''), ''YOUNGER'', ''연하'', 1, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''AGE_PREFERENCE'' AND po.value = ''YOUNGER'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''AGE_PREFERENCE''), ''SAME_AGE'', ''동갑'', 2, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''AGE_PREFERENCE'' AND po.value = ''SAME_AGE'')
UNION ALL
SELECT gen_random_uuid(), (SELECT id FROM preference_types WHERE code = ''AGE_PREFERENCE''), ''NO_PREFERENCE'', ''상관없음'', 3, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM preference_options po JOIN preference_types pt ON po.preference_type_id = pt.id WHERE pt.code = ''AGE_PREFERENCE'' AND po.value = ''NO_PREFERENCE'');s.s3.ap-northeast-2.amazonaws.com/icons/gaming.png'),
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
