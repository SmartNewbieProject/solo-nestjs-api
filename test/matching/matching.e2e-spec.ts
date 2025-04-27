import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestApp } from '../utils/test-app';
import { AuthHelper } from '../utils/auth-helper';
import { Role } from '@/auth/domain/user-role.enum';

describe('매칭 컨트롤러 (e2e)', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let authHelper: AuthHelper;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    // 테스트 앱 초기화
    testApp = new TestApp();
    app = await testApp.init();
    authHelper = new AuthHelper(app);

    try {
      // 테스트 사용자 생성
      const testUser = await testApp.getTestDb().createTestUser(Role.USER);
      userId = testUser.id;
      userToken = await authHelper.login(testUser.email, testUser.password);
      console.log('사용자 로그인 성공:', userToken);

      // 테스트 관리자 생성
      const testAdmin = await testApp.getTestDb().createTestAdmin();
      adminId = testAdmin.id;
      adminToken = await authHelper.login(testAdmin.email, testAdmin.password);
      console.log('관리자 로그인 성공:', adminToken);
    } catch (error) {
      console.error('테스트 설정 중 오류 발생:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // 테스트 앱 종료 및 정리
    await testApp.close();
  });

  describe('GET /api/matching/total-count', () => {
    it('인증된 사용자는 전체 매칭 수를 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matching/total-count')
        .set(authHelper.getAuthHeader(userToken))
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });

    it('인증되지 않은 사용자는 전체 매칭 수를 조회할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .get('/api/matching/total-count')
        .expect(401);
    });
  });

  describe('GET /api/matching/users', () => {
    it('관리자는 매칭 대상 사용자 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matching/users')
        .set(authHelper.getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);
    });

    it('일반 사용자는 매칭 대상 사용자 목록을 조회할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .get('/api/matching/users')
        .set(authHelper.getAuthHeader(userToken))
        .expect(403);
    });
  });

  describe('GET /api/matching', () => {
    it('인증된 사용자는 자신의 매칭 파트너를 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matching')
        .set(authHelper.getAuthHeader(userToken))
        .expect(200);

      // 응답 형식 확인
      expect(response.body).toBeDefined();
      // 새로 생성된 사용자는 매칭 파트너가 없을 것이므로 특정 형식만 확인
      expect(response.body).toHaveProperty('type');
    });

    it('인증되지 않은 사용자는 매칭 파트너를 조회할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .get('/api/matching')
        .expect(401);
    });
  });

  describe('GET /api/matching/next-date', () => {
    it('인증된 사용자는 다음 매칭 날짜를 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matching/next-date')
        .set(authHelper.getAuthHeader(userToken))
        .expect(200);

      expect(response.body).toHaveProperty('nextMatchingDate');
      expect(typeof response.body.nextMatchingDate).toBe('string');
    });

    // 이 엔드포인트는 인증이 필요한 것으로 보임
    it('인증되지 않은 사용자는 다음 매칭 날짜를 조회할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .get('/api/matching/next-date')
        .expect(401);
    });
  });

  // 재매칭 테스트는 티켓이 필요하므로 별도의 설정이 필요할 수 있음
  describe('POST /api/matching/rematch', () => {
    it('인증된 사용자는 재매칭을 요청할 수 있어야 함 (티켓이 없는 경우 403 에러)', async () => {
      // 티켓이 없는 경우 403 에러가 발생할 것으로 예상
      const response = await request(app.getHttpServer())
        .post('/api/matching/rematch')
        .set(authHelper.getAuthHeader(userToken))
        .expect(403);

      // 응답 형식 확인
      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('error', '재매칭권이 없습니다.');
    });

    it('인증되지 않은 사용자는 재매칭을 요청할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .post('/api/matching/rematch')
        .expect(401);
    });
  });
});
