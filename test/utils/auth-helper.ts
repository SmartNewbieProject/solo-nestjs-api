import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class AuthHelper {
  constructor(private readonly app: INestApplication) {}

  async login(email: string, password: string): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(`로그인 실패: ${response.status} ${JSON.stringify(response.body)}`);
    }

    // 응답에서 액세스 토큰 추출
    const accessToken = response.body.accessToken;
    if (!accessToken) {
      throw new Error('액세스 토큰을 찾을 수 없습니다.');
    }

    return accessToken;
  }

  getAuthHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
  }
}
