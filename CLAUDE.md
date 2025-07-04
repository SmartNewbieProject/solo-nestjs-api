# Solo NestJS API 프로젝트 가이드

## 프로젝트 개요
대학생 매칭 플랫폼 API 서버 (NestJS 기반)

## 기술 스택
- **런타임**: Node.js
- **프레임워크**: NestJS (v11.0.1)
- **언어**: TypeScript (v5.7.3)
- **데이터베이스**: PostgreSQL with Drizzle ORM (v0.41.0)
- **캐싱**: Redis (ioredis v5.3.2)
- **벡터 검색**: Qdrant (v1.13.0)
- **인증**: JWT (jsonwebtoken v9.0.2)
- **파일 업로드**: AWS S3 SDK (v3.782.0)
- **이메일**: Nodemailer (v6.10.1)
- **결제**: Portone SDK (v0.14.0)
- **알림**: Slack Web API (v7.9.1)

## 패키지 매니저
- **pnpm** 사용

## 빌드 및 실행 명령어
```bash
# 빌드
pnpm run build

# 개발 서버 실행
pnpm run start:dev

# 운영 서버 실행
pnpm run start:prod

# 린트 검사
pnpm run lint

# 테스트
pnpm run test
pnpm run test:e2e
```

## 데이터베이스 명령어
```bash
# 스키마 생성
pnpm run db:generate

# 스키마 푸시
pnpm run db:push

# 스튜디오 실행
pnpm run db:studio

# 마이그레이션 실행
pnpm run migration:run
```

## 디렉터리 구조 및 컨벤션

### 모듈 구조
```
src/
├── admin/          # 관리자 기능
├── article/        # 커뮤니티 게시글
├── auth/           # 인증/회원가입
├── common/         # 공통 모듈
├── config/         # 설정 (Redis, Qdrant)
├── database/       # 데이터베이스 스키마/마이그레이션
├── embedding/      # 벡터 임베딩 기능
├── matching/       # 매칭 로직
├── payment/        # 결제 시스템
├── user/           # 사용자 관리
└── types/          # 타입 정의
```

### 각 모듈 내부 구조
```
module/
├── controllers/    # REST API 컨트롤러
├── services/       # 비즈니스 로직
├── repository/     # 데이터 접근 계층
├── dto/           # 데이터 전송 객체
├── docs/          # Swagger 문서
├── domain/        # 도메인 로직
└── module.ts      # 모듈 정의
```

## 코딩 컨벤션

### 파일 이름
- **컨트롤러**: `*.controller.ts`
- **서비스**: `*.service.ts`
- **레포지토리**: `*.repository.ts`
- **DTO**: `*.dto.ts`
- **모듈**: `*.module.ts`

### 코드 스타일
- **들여쓰기**: 탭 (2칸 폭)
- **문자열**: 싱글 쿼트 (`'`) 사용
- **줄 길이**: 100자 제한
- **import 정리**: 자동 정리 활성화

### 유효성 검사
- **class-validator** 사용
- **class-transformer** 사용
- API 문서는 **@nestjs/swagger** 활용

### 임포트 별칭
```typescript
@/ -> src/
@auth/ -> src/auth/
@common/ -> src/common/
@types/ -> src/types/
@database/ -> src/database/
```

## 주요 기능 모듈

### 1. 인증 (auth/)
- 로그인/회원가입
- JWT 토큰 관리
- 대학교 인증

### 2. 매칭 (matching/)
- 사용자 매칭 알고리즘
- 벡터 기반 유사도 계산
- 매칭 히스토리 관리

### 3. 커뮤니티 (article/)
- 게시글 CRUD
- 댓글 시스템
- 익명 사용자 생성

### 4. 결제 (payment/)
- Portone 연동
- 티켓 시스템

### 5. 관리자 (admin/)
- 사용자 관리
- 통계 데이터
- 배치 작업

## 환경 변수
- DATABASE_* : PostgreSQL 설정
- REDIS_* : Redis 설정
- AWS_* : S3 설정
- QDRANT_* : Qdrant 설정

## 테스트
- **Unit Tests**: Jest 사용
- **E2E Tests**: Supertest 사용
- **Test DB**: 별도 테스트 데이터베이스 사용

## 배포
- **Docker**: Dockerfile 포함
- **AWS CodeBuild**: buildspec.yml
- **AWS CodeDeploy**: appspec.yaml