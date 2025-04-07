INSERT INTO preference_types (id, code, name, multi_select, maximum_choice_count, created_at, updated_at) VALUES ('4cb7f832-9bbf-42d7-bf39-b1f21f8a8096', 'MILITARY_STATUS_MALE', '군필 여부', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at) VALUES ('01HNGW1234567890ABCDEF001', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8096', 'SERVED', '군필', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('01HNGW1234567890ABCDEF002', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8096', 'NOT_SERVED', '미필', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('01HNGW1234567890ABCDEF003', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8096', 'EXEMPTED', '면제', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO preference_types (id, code, name, multi_select, maximum_choice_count, created_at, updated_at) VALUES ('4cb7f832-9bbf-42d7-bf39-b1f21f8a8097', 'MILITARY_PREFERENCE_FEMALE', '군필 여부 선호도', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO preference_options (id, preference_type_id, value, display_name, created_at, updated_at) VALUES ('01HNGW1234567890ABCDEF001', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8097', 'SERVED', '군필이었으면 좋겠음', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('01HNGW1234567890ABCDEF002', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8097', 'NOT_SERVED', '미필(면제)이어도 괜찮음', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('01HNGW1234567890ABCDEF003', '4cb7f832-9bbf-42d7-bf39-b1f21f8a8097', 'NEVERMIND', '상관없음', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
