# E2E 테스트 가이드

이 프로젝트는 실제 데이터베이스에 연결하여 E2E 테스트를 수행합니다. 테스트는 실제 데이터베이스에 테스트 데이터를 생성하고, 테스트가 완료된 후 해당 데이터를 정리합니다.

## 테스트 환경 설정

1. `.env.test` 파일을 프로젝트 루트 디렉토리에 생성하고 필요한 환경 변수를 설정합니다.
   ```
   # 테스트 환경 설정
   NODE_ENV=test
   PORT=8045

   # 데이터베이스 설정 (실제 개발 DB와 동일하게 설정하거나 테스트용 DB 사용)
   DATABASE_USER=your_db_user
   DATABASE_HOST=your_db_host
   DATABASE_PORT=your_db_port
   DATABASE_NAME=your_db_name
   DATABASE_PASSWORD=your_db_password

   # JWT 설정
   JWT_SECRET=test_jwt_secret_key_for_e2e_testing

   # 시간대 설정
   TZ=Asia/Seoul
   ```

2. 테스트 실행 전에 데이터베이스가 실행 중인지 확인합니다.

## 테스트 실행 방법

### 모든 E2E 테스트 실행
```bash
pnpm test:e2e
```

### 특정 모듈의 E2E 테스트 실행
```bash
# 매칭 모듈 테스트
pnpm test:e2e:matching

# 인증 모듈 테스트 (직접 실행)
pnpm test:e2e test/auth/auth.e2e-spec.ts
```

### 테스트 디버깅
```bash
pnpm test:e2e:debug
```

### 테스트 감시 모드 실행
```bash
pnpm test:e2e:watch
```

## 테스트 구조

- `test/utils/`: 테스트 유틸리티 클래스 및 헬퍼 함수
  - `test-app.ts`: 테스트 애플리케이션 설정 및 초기화
  - `test-database.ts`: 테스트 데이터베이스 연결 및 테스트 데이터 관리
  - `auth-helper.ts`: 인증 관련 헬퍼 함수

- `test/matching/`: 매칭 모듈 테스트
  - `matching.e2e-spec.ts`: 매칭 컨트롤러 E2E 테스트

- `test/auth/`: 인증 모듈 테스트
  - `auth.e2e-spec.ts`: 인증 컨트롤러 E2E 테스트

## 테스트 데이터 관리

테스트는 다음과 같은 방식으로 테스트 데이터를 관리합니다:

1. 테스트 시작 전에 필요한 테스트 사용자 및 데이터를 생성합니다.
2. 테스트 중에 생성된 모든 데이터는 테스트 종료 후 자동으로 정리됩니다.
3. 테스트 데이터는 `TestDatabase` 클래스에서 관리합니다.

## 새로운 E2E 테스트 작성 방법

1. 테스트 파일을 생성합니다 (예: `test/your-module/your-module.e2e-spec.ts`).
2. `TestApp` 클래스를 사용하여 테스트 애플리케이션을 초기화합니다.
3. 필요한 테스트 데이터를 생성합니다.
4. 테스트 케이스를 작성합니다.
5. 테스트 종료 후 `testApp.close()`를 호출하여 리소스를 정리합니다.

예시:
```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestApp } from '../utils/test-app';
import { AuthHelper } from '../utils/auth-helper';

describe('Your Module (e2e)', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let authHelper: AuthHelper;
  let userToken: string;

  beforeAll(async () => {
    // 테스트 앱 초기화
    testApp = new TestApp();
    app = await testApp.init();
    authHelper = new AuthHelper(app);

    // 테스트 사용자 생성 및 로그인
    const testUser = await testApp.getTestDb().createTestUser();
    userToken = await authHelper.login(testUser.email, testUser.password);
  });

  afterAll(async () => {
    // 테스트 앱 종료 및 정리
    await testApp.close();
  });

  it('should do something', async () => {
    // 테스트 코드 작성
    await request(app.getHttpServer())
      .get('/api/your-endpoint')
      .set(authHelper.getAuthHeader(userToken))
      .expect(200);
  });
});
```
