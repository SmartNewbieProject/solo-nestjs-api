import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Gender } from '@/types/enum';
import { Role } from '@/auth/domain/user-role.enum';
import * as bcrypt from 'bcryptjs';

// 환경 변수 로드
dotenv.config({ path: '.env.test' });

export class TestDatabase {
  private pool: Pool;
  private client: PoolClient | null = null;
  private testUsers: { id: string; email: string; password: string }[] = [];

  constructor() {
    this.pool = new Pool({
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME,
    });
  }

  async connect(): Promise<void> {
    try {
      this.client = await this.pool.connect();
      console.log('테스트 데이터베이스 연결 성공');
      await this.client.query("SET timezone = 'Asia/Seoul'");
    } catch (error) {
      console.error('테스트 데이터베이스 연결 실패:', error);
      throw new Error('테스트 데이터베이스 연결에 실패했습니다.');
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
    await this.pool.end();
    console.log('테스트 데이터베이스 연결 종료');
  }

  async createTestUser(
    role: Role = Role.USER,
  ): Promise<{ id: string; email: string; password: string }> {
    if (!this.client) {
      throw new Error('데이터베이스에 연결되어 있지 않습니다.');
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const email = `test-${userId.substring(0, 8)}@example.com`;
    const plainPassword = 'Test1234!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const name = `테스트유저_${userId.substring(0, 5)}`;

    // 사용자 생성
    await this.client.query(
      'INSERT INTO users (id, name, email, password, phone_number, profile_id, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        userId,
        name,
        email,
        hashedPassword,
        '01012345678',
        profileId,
        role,
        new Date(),
        new Date(),
      ],
    );

    // 프로필 생성
    await this.client.query(
      'INSERT INTO profiles (id, user_id, name, age, gender, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [profileId, userId, name, 25, Gender.MALE, new Date(), new Date()],
    );

    // 사용자 선호도 생성
    const userPreferenceId = uuidv4();
    await this.client.query(
      'INSERT INTO user_preferences (id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)',
      [userPreferenceId, userId, new Date(), new Date()],
    );

    const user = { id: userId, email, password: plainPassword };
    this.testUsers.push(user);
    return user;
  }

  async createTestAdmin(): Promise<{
    id: string;
    email: string;
    password: string;
  }> {
    return this.createTestUser(Role.ADMIN);
  }

  async getPreferenceOptions(): Promise<
    { id: string; typeName: string; displayName: string }[]
  > {
    if (!this.client) {
      throw new Error('데이터베이스에 연결되어 있지 않습니다.');
    }

    const result = await this.client.query(`
      SELECT po.id, pt.name as type_name, po.display_name
      FROM preference_options po
      JOIN preference_types pt ON po.preference_type_id = pt.id
      ORDER BY pt.code
      LIMIT 10
    `);

    return result.rows.map((row) => ({
      id: row.id,
      typeName: row.type_name,
      displayName: row.display_name,
    }));
  }

  async cleanupTestData(): Promise<void> {
    if (!this.client) {
      throw new Error('데이터베이스에 연결되어 있지 않습니다.');
    }

    // 테스트 중 생성된 사용자 ID 목록
    const userIds = this.testUsers.map((user) => user.id);

    if (userIds.length === 0) {
      return;
    }

    // 매칭 데이터 삭제
    await this.client.query(
      `DELETE FROM matches WHERE my_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})`,
      userIds,
    );

    // 사용자 선호도 옵션 삭제
    await this.client.query(
      `
      DELETE FROM user_preference_options
      WHERE user_preference_id IN (
        SELECT id FROM user_preferences WHERE user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
      )
    `,
      userIds,
    );

    // 사용자 선호도 삭제
    await this.client.query(
      `DELETE FROM user_preferences WHERE user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})`,
      userIds,
    );

    // 대학 정보 삭제
    await this.client.query(
      `DELETE FROM university_details WHERE user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})`,
      userIds,
    );

    // 프로필 이미지 삭제
    await this.client.query(
      `
      DELETE FROM profile_images
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})
      )
    `,
      userIds,
    );

    // 프로필 삭제
    await this.client.query(
      `DELETE FROM profiles WHERE user_id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})`,
      userIds,
    );

    // 사용자 삭제
    await this.client.query(
      `DELETE FROM users WHERE id IN (${userIds.map((_, i) => `$${i + 1}`).join(',')})`,
      userIds,
    );

    // 테스트 사용자 목록 초기화
    this.testUsers = [];
  }
}
