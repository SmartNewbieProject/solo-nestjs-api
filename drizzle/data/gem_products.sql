-- 구슬 상품 데이터 삽입
INSERT INTO gem_products (
    id,
    product_name,
    gem_amount,
    bonus_gems,
    total_gems,
    price,
    discount_rate,
    sort_order,
    is_active,
    created_at,
    updated_at
) VALUES
      (gen_random_uuid(), '스타터 팩', 15, 0, 15, 8800, 0, 1, true, NOW(), NOW()),
      (gen_random_uuid(), '베이직 팩', 30, 0, 30, 14000, 0, 2, true, NOW(), NOW()),
      (gen_random_uuid(), '스탠다드 팩', 60, 0, 60, 22000, 0, 3, true, NOW(), NOW()),
      (gen_random_uuid(), '플러스 팩', 130, 0, 130, 39000, 0, 4, true, NOW(), NOW()),
      (gen_random_uuid(), '프리미엄 팩', 200, 0, 200, 57900, 0, 5, true, NOW(), NOW()),
      (gen_random_uuid(), '메가 팩', 400, 0, 400, 109000, 0, 6, true, NOW(), NOW()),
      (gen_random_uuid(), '울트라 팩', 500, 0, 500, 129000, 0, 7, true, NOW(), NOW()),
      (gen_random_uuid(), '맥시멈 팩', 800, 0, 800, 198000, 0, 8, true, NOW(), NOW());
