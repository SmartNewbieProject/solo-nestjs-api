-- 먼저 images 테이블에 이미지 데이터 삽입
WITH profile_data AS (
  SELECT 
    p.id as profile_id,
    p.gender,
    uuid_generate_v4() as image_id
  FROM profiles p
  WHERE p.id NOT IN (
    SELECT DISTINCT profile_id FROM profile_images
  )
)
INSERT INTO images (
  id,
  s3_url,
  s3_key,
  mime_type,
  is_verified,
  created_at,
  updated_at
)
SELECT 
  pd.image_id,
  CASE 
    WHEN pd.gender = 'MALE' THEN 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png'
    ELSE 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png'
  END as s3_url,
  CASE 
    WHEN pd.gender = 'MALE' THEN 'resources/mock_man_0.png'
    ELSE 'resources/mock_woman_0.png'
  END as s3_key,
  'image/png' as mime_type,
  true as is_verified,
  NOW() as created_at,
  NOW() as updated_at
FROM profile_data pd;

-- 그 다음 profile_images 테이블에 연결 데이터 삽입
WITH profile_data AS (
  SELECT 
    p.id as profile_id,
    p.gender,
    i.id as image_id
  FROM profiles p
  CROSS JOIN LATERAL (
    SELECT id 
    FROM images 
    WHERE s3_url = CASE 
      WHEN p.gender = 'MALE' THEN 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_man_0.png'
      ELSE 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/mock_woman_0.png'
    END
    LIMIT 1
  ) i
  WHERE p.id NOT IN (
    SELECT DISTINCT profile_id FROM profile_images
  )
)
INSERT INTO profile_images (
  id,
  profile_id,
  image_id,
  image_order,
  is_main,
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4() as id,
  pd.profile_id,
  pd.image_id,
  1 as image_order,
  true as is_main,
  NOW() as created_at,
  NOW() as updated_at
FROM profile_data pd;