-- 관심사 옵션 데이터 삽입
INSERT INTO preference_options (id, preference_type_id, value, display_name, image_url, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'MUSIC', '음악', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/music.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'EXHIBITION', '전시', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/exhibition.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'HIKING', '등산', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/hiking.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'PHOTOGRAPHY', '사진', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/capture.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'BICYCLE', '자전거', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/biking.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'MOVIE', '영화', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/movie.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'PET', '반려동물', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/pet.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'PERFORMANCE', '공연', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/festival.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'CAFE', '카페', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cafe.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'FASHION', '패션', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/fashion.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'READING', '독서', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/reading.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'GAME', '게임', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/gaming.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'TRAVEL', '여행', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/travel.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'COOKING', '요리', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/cooking.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'EXERCISE', '운동', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/exercise.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'CLEANING', '청소', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/clean.png', NOW(), NOW()),
  (gen_random_uuid(), 'f2d9d75c-1e60-465f-8ade-d75d7e457a14', 'SPORTS', '스포츠 관람', 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/icons/sports.png', NOW(), NOW());
