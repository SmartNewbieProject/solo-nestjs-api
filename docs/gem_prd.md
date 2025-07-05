# 썸타임 구슬 시스템 기능 PRD

## 1. 기능 개요

### 1.1 기능명
구슬(Gem) 재화 시스템

### 1.2 기능 목적
사용자가 구슬을 구매하고 소비하여 프리미엄 기능을 이용할 수 있는 가상 화폐 시스템 구현

## 2. 핵심 기능

### 2.1 구슬 충전 기능
이미지에 제시된 구슬 패키지 제공:
- **스타터 팩**: 8,800원 → 15구슬 (1회차 기본 세트 이용 가능)
- **베이직 팩**: 14,000원 → 30구슬 (2회차 기본 세트 이용 가능)
- **스탠다드 팩**: 22,000원 → 60구슬 (5회차 기본 세트 이용 가능)
- **플러스 팩**: 39,000원 → 130구슬 (11회차 기본 세트 이용 가능)
- **프리미엄 팩**: 57,900원 → 200구슬 (18회차 기본 세트 이용 가능)
- **메가 팩**: 109,000원 → 400구슬 (36회차 기본 세트 이용 가능)
- **울트라 팩**: 129,000원 → 500구슬 (45회차 기본 세트 이용 가능)
- **맥시멈 팩**: 198,000원 → 800구슬 (72회차 기본 세트 이용 가능)

결제 수단: 카드결제, 간편결제, 휴대폰 결제

### 2.2 구슬 소비 기능
제공된 패키지 이용권에 따른 구슬 소비:
- **다른 사람 찾기** (기존 재매칭권): 2구슬
- **좋아요 표시**: 3구슬
- **채팅방 열기**: 6구슬

**기본 세트 이용권 = 11구슬** (2구슬 + 3구슬 + 6구슬)

### 2.3 구슬 관리 기능
- 현재 보유 구슬 조회
- 구슬 사용 내역 확인
- 구슬 충전 내역 확인

## 3. 데이터베이스 테이블 설계

### 3.1 user_gems
**목적**: 사용자별 현재 구슬 보유량 실시간 관리 (성능 최적화용 캐시)
```sql
- user_id (PK, FK): 사용자 ID
- gem_balance: 현재 구슬 보유량
- total_charged: 누적 충전량 (통계용)
- total_consumed: 누적 소비량 (통계용)
- last_transaction_at: 마지막 거래 시간
- created_at: 생성일
- updated_at: 수정일
```

### 3.2 gem_products
**목적**: 구매 가능한 구슬 상품 정보 관리
```sql
- product_id (PK): 상품 ID
- product_name: 상품명 (예: "스타터 팩", "베이직 팩")
- gem_amount: 기본 구슬 개수
- bonus_gems: 보너스 구슬 개수
- total_gems: 총 구슬 개수 (gem_amount + bonus_gems)
- price: 가격 (원)
- discount_rate: 할인율 (%)
- sort_order: 정렬 순서
- is_active: 판매 활성화 여부
- created_at: 생성일
- updated_at: 수정일
```

### 3.3 gem_transactions
**목적**: 구슬 충전/소비 모든 거래 내역 기록 (감사 추적용)
```sql
- transaction_id (PK): 거래 ID
- user_id (FK): 사용자 ID
- transaction_type: 거래 타입 (CHARGE/CONSUME)
- gem_amount: 구슬 수량
- balance_before: 거래 전 잔액
- balance_after: 거래 후 잔액
- reference_type: 참조 타입 (PAYMENT/PROFILE_OPEN/LIKE_MESSAGE/CHAT/FILTER)
- reference_id: 참조 ID (결제ID, 대상사용자ID 등)
- description: 거래 설명
- created_at: 거래일시
```

### 3.4 gem_payments
**목적**: 구슬 충전 시 결제 정보 관리
```sql
- payment_id (PK): 결제 ID
- user_id (FK): 사용자 ID
- product_id (FK): 구매한 상품 ID
- payment_method: 결제 수단 (CARD/SIMPLE_PAY/PHONE)
- payment_amount: 결제 금액
- payment_status: 결제 상태 (PENDING/COMPLETED/FAILED/CANCELLED/REFUNDED)
- pg_transaction_id: PG사 거래번호
- receipt_url: 영수증 URL
- paid_at: 결제 완료일시
- created_at: 결제 요청일시
- updated_at: 상태 변경일시
```

### 3.5 gem_feature_costs
**목적**: 각 기능별 구슬 소비량 설정 관리 (운영 설정용)
```sql
- cost_id (PK): 설정 ID
- feature_type: 기능 타입 (PROFILE_OPEN/LIKE_MESSAGE/CHAT_START/PREMIUM_FILTER)
- gem_cost: 소비 구슬 수
- description: 기능 설명
- is_active: 활성화 여부
- effective_from: 적용 시작일
- created_at: 생성일
- updated_at: 수정일
```

### 3.6 gem_daily_stats
**목적**: 일별 구슬 사용 통계 (비즈니스 분석용)
```sql
- stat_id (PK): 통계 ID
- date: 통계 날짜
- feature_type: 기능 타입
- total_usage_count: 총 사용 횟수
- total_gems_consumed: 총 소비 구슬
- unique_users: 순 사용자 수
- success_rate: 성공률 (%)
- created_at: 생성일
```

## 4. 기술적 고려사항

### 4.1 성능 최적화
- **user_gems 테이블 활용**: 빠른 잔액 조회를 위한 캐시 테이블
- **트랜잭션 원자성**: 잔액 변경과 거래 기록이 동시에 처리
- **동시성 제어**: SELECT FOR UPDATE를 통한 잔액 수정 시 락 처리

### 4.2 데이터 일관성
- **이중 기록**: user_gems(캐시) + gem_transactions(감사)
- **주기적 검증**: 배치 작업으로 잔액과 거래내역 합계 비교
- **복구 메커니즘**: 불일치 발견 시 거래내역 기준으로 잔액 재계산

### 4.3 보안
- **서버 사이드 검증**: 모든 구슬 소비는 서버에서 검증
- **결제 연동 보안**: PG사와의 안전한 통신 및 위변조 방지
- **중복 결제 방지**: 동일한 결제 요청에 대한 중복 처리 차단

## 5. API 명세

### 5.1 구슬 관련 API
- `GET /api/v1/gems/balance` - 사용자 구슬 잔액 조회
- `GET /api/v1/gems/products` - 구매 가능한 구슬 패키지 목록
- `POST /api/v1/gems/purchase` - 구슬 패키지 구매 (결제 연동)
- `POST /api/v1/gems/consume` - 구슬 소비 (기능 사용)

### 5.2 주요 API 상세

#### 구슬 잔액 조회 API
```json
GET /api/v1/gems/balance

Response:
{
  "success": true,
  "data": {
    "gem_balance": 23,
    "total_charged": 30,
    "total_consumed": 7,
    "last_transaction_at": "2025-01-15T10:30:00Z"
  }
}
```

#### 구슬 패키지 목록 조회 API
```json
GET /api/v1/gems/products

Response:
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "스타터 팩",
      "gem_amount": 15,
      "bonus_gems": 0,
      "total_gems": 15,
      "price": 8800,
      "discount_rate": 0,
      "sort_order": 1
    },
    {
      "product_id": 2,
      "product_name": "베이직 팩",
      "gem_amount": 30,
      "bonus_gems": 0,
      "total_gems": 30,
      "price": 14000,
      "discount_rate": 0,
      "sort_order": 2
    }
  ]
}
```

#### 구슬 패키지 구매 API
```json
POST /api/v1/gems/purchase
{
  "product_id": 1,
  "payment_method": "CARD"
}

Response:
{
  "success": true,
  "data": {
    "payment_id": "pay_123456",
    "payment_url": "https://pg.example.com/payment/pay_123456",
    "payment_amount": 8800,
    "gem_amount": 15,
    "expires_at": "2025-01-15T11:00:00Z"
  }
}
```

#### 구슬 소비 API
```json
POST /api/v1/gems/consume
{
  "feature_type": "PROFILE_OPEN",
  "target_user_id": 12345
}

Response:
{
  "success": true,
  "data": {
    "gem_cost": 2,
    "balance_before": 25,
    "balance_after": 23,
    "transaction_id": "txn_123456",
    "feature_type": "PROFILE_OPEN"
  }
}
```

## 6. 구현 우선순위

### Phase 1 (핵심 기능)
1. 기본 구슬 시스템 구축 (테이블 생성)
2. 구슬 충전 기능
3. 구슬 소비 기능 (프로필 오픈)

### Phase 2 (확장 기능)
1. 다양한 소비 기능 추가
2. 구슬 사용 통계 및 분석
3. 프로모션 및 이벤트 구슬

### Phase 3 (고도화)
1. 구슬 선물 기능
2. 구슬 적립 이벤트
3. VIP 등급별 구슬 혜택