-- 구슬 상품 데이터 삽입 (할인율 반영)
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
      (gen_random_uuid(), '스타터 팩', 15, 0, 15, 8800, 0.0, 1, true, NOW(), NOW()),
      (gen_random_uuid(), '베이직 팩', 30, 6, 36, 14000, 20.5, 2, true, NOW(), NOW()),
      (gen_random_uuid(), '스탠다드 팩', 60, 30, 90, 22000, 50.0, 3, true, NOW(), NOW()),
      (gen_random_uuid(), '플러스 팩', 130, 55, 185, 39000, 59.7, 4, true, NOW(), NOW()),
      (gen_random_uuid(), '프리미엄 팩', 200, 80, 280, 57900, 63.4, 5, true, NOW(), NOW()),
      (gen_random_uuid(), '메가 팩', 400, 160, 560, 109000, 65.6, 6, true, NOW(), NOW()),
      (gen_random_uuid(), '울트라 팩', 500, 200, 700, 129000, 67.4, 7, true, NOW(), NOW()),
      (gen_random_uuid(), '맥시멈 팩', 800, 350, 1150, 198000, 68.8, 8, true, NOW(), NOW());