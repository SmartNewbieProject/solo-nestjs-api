-- 음주 선호도 - 선호도 옵션
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'PREFER_NONE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'PREFER_OCCASIONALLY' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'PREFER_MODERATE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 3, deprecated = false 
WHERE value = 'OKAY' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 4, deprecated = false 
WHERE value = 'FREQUENT_OKAY' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

-- 음주 선호도 - 본인 상태
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'NEVER' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'RARELY' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'MODERATE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 3, deprecated = false 
WHERE value = 'FREQUENT' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

UPDATE preference_options SET "order" = 4, deprecated = false 
WHERE value = 'VERY_FREQUENT' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'DRINKING');

-- 흡연 선호도
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'NON_SMOKER' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'SMOKING');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'E_CIGARETTE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'SMOKING');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'NO_PREFERENCE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'SMOKING');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'SMOKER' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'SMOKING');

-- 문신 선호도
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'NONE_STRICT' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'TATTOO');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'SMALL' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'TATTOO');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'NONE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'TATTOO');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'OKAY' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'TATTOO');

-- 군필 여부
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'NOT_SERVED' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'EXEMPTED' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'SERVED' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_STATUS_MALE');

-- 군필 여부 선호도
UPDATE preference_options SET "order" = 0, deprecated = false 
WHERE value = 'NOT_SERVED' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE');

UPDATE preference_options SET "order" = 1, deprecated = false 
WHERE value = 'NO_PREFERENCE' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE');

UPDATE preference_options SET "order" = 2, deprecated = false 
WHERE value = 'SERVED' AND preference_type_id = (SELECT id FROM preference_types WHERE code = 'MILITARY_PREFERENCE_FEMALE');