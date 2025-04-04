import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { profiles } from '@database/schema/profiles';
import { Gender } from '@database/schema/enums';
import { eq } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';

// 사용자 생성 요청 인터페이스
interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: Gender;
}

@Injectable()
export class SignupRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // 이메일로 사용자 찾기
  async findUserByEmail(email: string) {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result.length > 0;
  }

  // 사용자 및 프로필 생성
  async createUser(createUserDto: CreateUserDto) {
    // 트랜잭션 시작
    return await this.db.transaction(async (tx) => {
      // 프로필 먼저 생성
      const [profile] = await tx.insert(profiles)
        .values({
          name: createUserDto.name,
          age: createUserDto.age,
          gender: createUserDto.gender,
        })
        .returning();

      // 사용자 생성
      const [user] = await tx.insert(users)
        .values({
          email: createUserDto.email,
          password: createUserDto.password,
          name: createUserDto.name,
          profileId: profile.id,
        })
        .returning();

      // 프로필 ID를 사용자에 연결
      await tx.update(profiles)
        .set({ userId: user.id })
        .where(eq(profiles.id, profile.id));

      return user;
    });
  }
}
