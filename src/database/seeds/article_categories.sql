INSERT INTO article_categories (id, code, display_name, emoji_url, created_at, updated_at)
VALUES
  (
    gen_random_uuid(), 
    'general',
    '실시간', 
    'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/realtime.png',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'review',
    '리뷰', 
    'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/review.png',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'love-concerns',
    '연애상담', 
    'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/love-letter.png',
    NOW(),
    NOW()
  );
  
