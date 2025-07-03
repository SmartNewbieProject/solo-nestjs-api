import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestApp } from '../utils/test-app';
import { Role } from '@/auth/domain/user-role.enum';

describe('프로필 컨트롤러 (e2e)', () => {
  let app: INestApplication;
  let testApp: TestApp;
  let testUser: { id: string; email: string; password: string };
  let accessToken: string;
  let preferenceOptions: {
    id: string;
    typeName: string;
    displayName: string;
  }[];

  beforeAll(async () => {
    testApp = new TestApp();
    app = await testApp.init();

    // 테스트 사용자 생성
    testUser = await testApp.getTestDb().createTestUser(Role.USER);

    // 로그인하여 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginResponse.body.accessToken;

    // 테스트용 선호도 옵션 조회
    preferenceOptions = await testApp.getTestDb().getPreferenceOptions();
  });

  afterAll(async () => {
    await testApp.close();
  });

  describe('GET /api/preferences/self', () => {
    it('빈 본인 성향 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PATCH /api/preferences/self', () => {
    it('본인 성향을 성공적으로 저장할 수 있어야 함', async () => {
      // 테스트용 선호도 데이터 구성
      const testPreferences = preferenceOptions.slice(0, 3);
      const groupedPreferences = testPreferences.reduce(
        (acc, option) => {
          if (!acc[option.typeName]) {
            acc[option.typeName] = [];
          }
          acc[option.typeName].push(option.id);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      const selfPreferenceData = Object.entries(groupedPreferences).map(
        ([typeName, optionIds]) => ({
          typeName,
          optionIds,
        }),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: selfPreferenceData,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testUser.id);
      expect(response.body).toHaveProperty('preferences');
      expect(Array.isArray(response.body.preferences)).toBe(true);
    });

    it('저장된 본인 성향을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // 각 선호도 그룹이 올바른 구조를 가지고 있는지 확인
      response.body.forEach((preference) => {
        expect(preference).toHaveProperty('typeName');
        expect(preference).toHaveProperty('selectedOptions');
        expect(Array.isArray(preference.selectedOptions)).toBe(true);

        preference.selectedOptions.forEach((option) => {
          expect(option).toHaveProperty('id');
          expect(option).toHaveProperty('displayName');
        });
      });
    });

    it('본인 성향을 수정할 수 있어야 함', async () => {
      // 다른 선호도 데이터로 수정
      const newTestPreferences = preferenceOptions.slice(3, 5);
      const groupedPreferences = newTestPreferences.reduce(
        (acc, option) => {
          if (!acc[option.typeName]) {
            acc[option.typeName] = [];
          }
          acc[option.typeName].push(option.id);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      const selfPreferenceData = Object.entries(groupedPreferences).map(
        ([typeName, optionIds]) => ({
          typeName,
          optionIds,
        }),
      );

      const response = await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: selfPreferenceData,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testUser.id);
    });

    it('빈 데이터로 본인 성향을 초기화할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [],
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testUser.id);

      // 초기화 후 조회하여 빈 상태 확인
      const getResponse = await request(app.getHttpServer())
        .get('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(getResponse.body)).toBe(true);
      expect(getResponse.body.length).toBe(0);
    });

    it('잘못된 선호도 타입명으로 요청시 에러를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
              typeName: '존재하지않는타입',
              optionIds: ['invalid-option-id'],
            },
          ],
        })
        .expect(400);
    });

    it('인증 토큰 없이 요청시 401 에러를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .send({
          data: [],
        })
        .expect(401);
    });
  });

  describe('본인 성향과 상대방 선호도 분리 확인', () => {
    it('본인 성향과 상대방 선호도가 독립적으로 관리되어야 함', async () => {
      // 상대방 선호도 설정
      const partnerPreferences = preferenceOptions.slice(0, 2);
      const groupedPartnerPreferences = partnerPreferences.reduce(
        (acc, option) => {
          if (!acc[option.typeName]) {
            acc[option.typeName] = [];
          }
          acc[option.typeName].push(option.id);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      const partnerPreferenceData = Object.entries(
        groupedPartnerPreferences,
      ).map(([typeName, optionIds]) => ({
        typeName,
        optionIds,
      }));

      await request(app.getHttpServer())
        .patch('/api/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: partnerPreferenceData,
        })
        .expect(200);

      // 본인 성향 설정
      const selfPreferences = preferenceOptions.slice(2, 4);
      const groupedSelfPreferences = selfPreferences.reduce(
        (acc, option) => {
          if (!acc[option.typeName]) {
            acc[option.typeName] = [];
          }
          acc[option.typeName].push(option.id);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      const selfPreferenceData = Object.entries(groupedSelfPreferences).map(
        ([typeName, optionIds]) => ({
          typeName,
          optionIds,
        }),
      );

      await request(app.getHttpServer())
        .patch('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: selfPreferenceData,
        })
        .expect(200);

      // 본인 성향 조회
      const selfResponse = await request(app.getHttpServer())
        .get('/api/preferences/self')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 전체 프로필 조회 (상대방 선호도 포함)
      const profileResponse = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 본인 성향과 상대방 선호도가 다른지 확인
      expect(selfResponse.body).not.toEqual(profileResponse.body.preferences);
      expect(selfResponse.body.length).toBeGreaterThan(0);
      expect(profileResponse.body.preferences.length).toBeGreaterThan(0);
    });
  });
});
