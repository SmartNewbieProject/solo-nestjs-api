-- 모든 사용자의 refresh_token을 null로 업데이트
UPDATE users
SET refresh_token = NULL
WHERE refresh_token IS NOT NULL;

-- 변경된 행 수 확인
SELECT COUNT(*) as updated_rows
FROM users
WHERE refresh_token IS NULL;
