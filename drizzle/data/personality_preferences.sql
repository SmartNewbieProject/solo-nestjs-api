-- 성격 선호도 타입 추가
INSERT INTO public.preference_types (id, code, name, multi_select, maximum_choice_count, created_at, updated_at) 
VALUES (gen_random_uuid(), 'personality', '성격', false, 1, NOW(), NOW());

-- 성격 선호도 옵션들 추가
INSERT INTO public.preference_options (id, preference_type_id, value, display_name, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'quiet', '조용한 성격', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'active', '활발한 성격', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'spontaneous', '즉흥적인 스타일', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'planned', '계획적인 스타일', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'adventurous', '모험을 즐기는 사람', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'emotional', '감성적인 사람', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'caring', '배려심 많은 사람', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'humorous', '유머감각 있는 사람', NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.preference_types WHERE code = 'personality'), 'leadership', '리더십 있는 사람', NOW(), NOW());
