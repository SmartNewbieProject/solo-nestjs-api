import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/ko';
import { DrizzleService } from '@/database/drizzle.service';
import { preferenceTypes, preferenceOptions } from '@/database/schema';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Gender } from '@/database/schema/enums';
import { Pool, PoolClient } from 'pg';

const PREFERENCE_TYPE_IDS = {
  PERSONALITY: 'ed4a1fa2-8f26-4862-8567-878a069ee524',
  DATING_STYLE: 'c7134ea1-f6d9-428c-a671-311169517efb',
  LIFESTYLE: 'ced223ca-9f2b-42a2-a028-21094843c117',
  DRINKING: '1142e39c-4937-400f-b964-c75e050beb69',
  SMOKING: '02fe95c2-467d-4a2d-ae51-c6efb4f42c72',
  TATTOO: '2b7273c5-62bd-49a5-9474-cf7ccf9e8850',
  INTEREST: '4cb7f832-9bbf-42d7-bf39-b1f21f8a8095',
  MBTI: 'f6cdb5ea-f141-443e-9e49-64a76bca7c35',
  AGE_PREFERENCE: '7cde7b8a-1de8-48f2-abdc-1ce3b3043867'
};

@Injectable()
export class UserSeeder {
  constructor(private readonly drizzleService: DrizzleService) {}

  async seed(count: number = 100, batchSize: number = 20) {
    const db = this.drizzleService.db;
    const pool: Pool = this.drizzleService.getPool(); 
    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);
    
    // 데이터베이스 연결 상태 확인
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      console.log('데이터베이스 연결 성공');
      
      // 데이터베이스 상태 확인
      const { rows: userRows } = await client.query('SELECT COUNT(*) FROM users');
      console.log(`현재 데이터베이스에 ${userRows[0].count} 명의 사용자가 있습니다.`);
      client.release();
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      if (client) client.release();
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    
    // 선호도 타입과 옵션을 미리 가져옵니다
    const allPreferenceTypes = await db.select().from(preferenceTypes);
    const allPreferenceOptions = await db.select().from(preferenceOptions);
    
    // 선호도 타입별 옵션 매핑
    type PreferenceOption = typeof allPreferenceOptions[number];
    const preferenceOptionsByType = allPreferenceOptions.reduce<Record<string, PreferenceOption[]>>((acc, option) => {
      const typeId = option.preferenceTypeId as string;
      if (!acc[typeId]) {
        acc[typeId] = [];
      }
      acc[typeId].push(option);
      return acc;
    }, {});
    
    // 각 선호도 타입별 옵션이 있는지 확인
    for (const typeId of Object.values(PREFERENCE_TYPE_IDS)) {
      if (!preferenceOptionsByType[typeId] || preferenceOptionsByType[typeId].length === 0) {
        console.log(`경고: ${typeId} 타입에 대한 옵션이 없습니다.`);
      }
    }
    
    console.log(`${count}명의 사용자 데이터 시드를 생성합니다... (배치 크기: ${batchSize})`);
    
    // 배치 단위로 처리
    for (let i = 0; i < count; i += batchSize) {
      // 명시적 트랜잭션 시작
      client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        console.log('트랜잭션 시작');
        
        const currentBatchSize = Math.min(batchSize, count - i);
        
        // 배치 내의 각 사용자에 대해 처리
        for (let j = 0; j < currentBatchSize; j++) {
          const userId = uuidv4();
          const profileId = uuidv4();
          const gender = faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]) as Gender;
          const name = faker.person.fullName();
          
          // 사용자 데이터 삽입 - 직접 SQL 쿼리 사용
          await client.query(
            'INSERT INTO users (id, name, email, password, profile_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
              userId, 
              name, 
              faker.internet.email({ firstName: name.split(' ')[0] }), 
              defaultPassword, 
              profileId, 
              new Date(), 
              new Date()
            ]
          );
          
          // 프로필 데이터 삽입 - 직접 SQL 쿼리 사용
          await client.query(
            'INSERT INTO profiles (id, user_id, age, gender, name, title, instagram_id, introduction, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
              profileId, 
              userId, 
              faker.number.int({ min: 20, max: 40 }), 
              gender, 
              name, 
              faker.person.jobTitle(), 
              faker.internet.username(), 
              faker.person.bio(), 
              new Date(), 
              new Date()
            ]
          );
          
          // 사용자 선호도 생성 (거리 선호도)
          const userPreferenceId = uuidv4();
          const distanceMax = faker.number.int({ min: 5, max: 50 }).toString();
          
          // 사용자 선호도 데이터 삽입
          await client.query(
            'INSERT INTO user_preferences (id, user_id, distance_max, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
            [
              userPreferenceId, 
              userId, 
              distanceMax, 
              new Date(), 
              new Date()
            ]
          );
          
          // 선호도 옵션 생성
          for (const preferenceType of allPreferenceTypes) {
            // 해당 선호도 타입에 맞는 옵션 필터링
            const typeOptions = allPreferenceOptions.filter(
              option => option.preferenceTypeId === preferenceType.id
            );
            
            if (typeOptions.length > 0) {
              // 특정 typeId에 대해서는 무조건 1개만 선택
              const singleOptionTypeIds = [
                PREFERENCE_TYPE_IDS.DRINKING,   // 음주
                PREFERENCE_TYPE_IDS.SMOKING,   // 흡연
                PREFERENCE_TYPE_IDS.TATTOO,    // 문신
                PREFERENCE_TYPE_IDS.MBTI,      // MBTI
                PREFERENCE_TYPE_IDS.AGE_PREFERENCE // 선호 나이대
              ];
              
              let selectedOptions;
              if (singleOptionTypeIds.includes(preferenceType.id)) {
                // 특정 타입은 무조건 1개만 선택
                selectedOptions = [faker.helpers.arrayElement(typeOptions)];
                console.log(`${preferenceType.name} 타입은 1개 옵션만 선택: ${selectedOptions[0].displayName}`);
              } else {
                // 다른 타입은 기존처럼 1~3개 선택
                const optionCount = faker.number.int({ min: 1, max: Math.min(3, typeOptions.length) });
                selectedOptions = faker.helpers.arrayElements(
                  typeOptions,
                  optionCount
                );
              }
              
              // 선택된 각 옵션에 대해 사용자 선호도 옵션 생성
              for (const option of selectedOptions) {
                await client.query(
                  'INSERT INTO user_preference_options (id, user_preference_id, preference_option_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
                  [
                    uuidv4(), 
                    userPreferenceId, 
                    option.id, 
                    new Date(), 
                    new Date()
                  ]
                );
              }
            }
          }
        }
        
        // 트랜잭션 커밋
        await client.query('COMMIT');
        console.log(`배치 ${Math.floor(i/batchSize) + 1} 트랜잭션 커밋 완료`);
        console.log(`${i + currentBatchSize}/${count} 사용자 생성 완료`);
        
      } catch (error) {
        // 오류 발생 시 롤백
        await client.query('ROLLBACK');
        console.error('트랜잭션 실패, 롤백 수행:', error);
        throw error;
      } finally {
        // 클라이언트 반환
        client.release();
      }
    }
    
    console.log(`${count}명의 사용자 데이터 시드 완료`);
  }
  
  async clear() {
    const db = this.drizzleService.db;
    const pool: Pool = this.drizzleService.getPool();
    
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      console.log('데이터베이스 연결 성공 (데이터 삭제)');
      
      await client.query('BEGIN');
      
      // 현재 데이터베이스 상태 확인
      const { rows: userRows } = await client.query('SELECT COUNT(*) FROM users');
      const { rows: profileRows } = await client.query('SELECT COUNT(*) FROM profiles');
      const { rows: preferenceRows } = await client.query('SELECT COUNT(*) FROM user_preferences');
      const { rows: preferenceOptionRows } = await client.query('SELECT COUNT(*) FROM user_preference_options');
      
      console.log('현재 데이터베이스 상태:');
      console.log(`- 사용자: ${userRows[0].count}개`);
      console.log(`- 프로필: ${profileRows[0].count}개`);
      console.log(`- 선호도: ${preferenceRows[0].count}개`);
      console.log(`- 선호도 옵션: ${preferenceOptionRows[0].count}개`);
      
      // 테스트 데이터 삭제 (생성 역순으로 삭제)
      console.log('사용자 선호도 옵션 삭제 중...');
      await client.query('DELETE FROM user_preference_options');
      
      console.log('사용자 선호도 삭제 중...');
      await client.query('DELETE FROM user_preferences');
      
      console.log('사용자 프로필 삭제 중...');
      await client.query('DELETE FROM profiles');
      
      console.log('사용자 삭제 중...');
      await client.query('DELETE FROM users');
      
      await client.query('COMMIT');
      console.log('데이터 삭제 완료');
      
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('데이터 삭제 중 오류 발생:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
