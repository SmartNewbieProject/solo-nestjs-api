import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestApp } from '../utils/test-app';
import { Role } from '@/auth/domain/user-role.enum';

describe('인증 컨트롤러 (e2e)', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let testUser: { id: string; email: string; password: string };

  beforeAll(async () => {
    // 테스트 앱 초기화
    testApp = new TestApp();
    app = await testApp.init();

    // 테스트 사용자 생성
    testUser = await testApp.getTestDb().createTestUser(Role.USER);
  });

  afterAll(async () => {
    // 테스트 앱 종료 및 정리
    await testApp.close();
  });

  describe('POST /api/auth/login', () => {
    it('올바른 자격 증명으로 로그인할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    it('잘못된 비밀번호로 로그인할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong_password',
        })
        .expect(401);
    });

    it('존재하지 않는 이메일로 로그인할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });
  });

  describe('GET /api/user', () => {
    it('인증된 사용자는 자신의 정보를 조회할 수 있어야 함', async () => {
      // 먼저 로그인하여 토큰 획득
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      // 토큰을 사용하여 사용자 정보 조회
      const response = await request(app.getHttpServer())
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testUser.id);
    });

    it('인증되지 않은 사용자는 정보를 조회할 수 없어야 함', async () => {
      await request(app.getHttpServer())
        .get('/api/user')
        .expect(401);
    });
  });
});
