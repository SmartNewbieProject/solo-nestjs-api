-- 흡연 선호도 옵션 업데이트
-- 기존 옵션 삭제
DELETE FROM preference_options WHERE preference_type_id = (SELECT id FROM preference_types WHERE code = 'SMOKING');

-- 새로운 흡연 선호도 옵션 추가
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'SMOKING'), 'NON_SMOKER', '비흡연자', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'SMOKING'), 'E_CIGARETTE', '전자담배', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'SMOKING'), 'SMOKER', '흡연자', null, NOW(), NOW());

-- 음주 선호도 옵션 업데이트
-- 기존 옵션 삭제
DELETE FROM preference_options WHERE preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

-- 새로운 음주 선호도 옵션 추가
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'NEVER', '전혀 안마시지 않음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'RARELY', '거의 못마심', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'MODERATE', '적당히 마심', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'FREQUENT', '자주 마심', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'VERY_FREQUENT', '매우 즐겨 마심', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'PREFER_NONE', '안마시면 좋겠음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'PREFER_OCCASIONALLY', '가끔마시면 좋겠음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'PREFER_MODERATE', '적당히 마시면 좋겠음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'OKAY', '마셔도 괜찮음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'DRINKING'), 'FREQUENT_OKAY', '자주 마셔도 괜찮음', null, NOW(), NOW());

-- 문신 선호도 옵션 업데이트
-- 기존 옵션 삭제
DELETE FROM preference_options WHERE preference_type_id = (SELECT id FROM preference_types WHERE code = 'TATTOO');

-- 새로운 문신 선호도 옵션 추가
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'TATTOO'), 'NONE_STRICT', '문신 X', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'TATTOO'), 'NONE', '문신 없음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'TATTOO'), 'SMALL', '작은 문신', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'TATTOO'), 'OKAY', '문신 O', null, NOW(), NOW());

-- 군필 여부 옵션 업데이트 (순서 변경)
-- 기존 옵션 삭제
DELETE FROM preference_options WHERE preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE');

-- 새로운 군필 여부 옵션 추가 (미필, 면제, 군필 순서)
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE'), 'NOT_SERVED', '미필', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE'), 'EXEMPTED', '면제', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE'), 'SERVED', '군필', null, NOW(), NOW());

-- 군필 여부 선호도 옵션 업데이트
-- 기존 옵션이 없으므로 새로 추가
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE'), 'NOT_SERVED', '미필', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE'), 'NO_PREFERENCE', '상관없음', null, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE'), 'SERVED', '군필', null, NOW(), NOW());