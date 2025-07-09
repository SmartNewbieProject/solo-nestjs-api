import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { profiles } from '@database/schema/profiles';
import { and, eq, isNull, between, sql, isNotNull } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';
import { generateUuidV7 } from '@database/schema/helper';
import { Role } from '@/auth/domain/user-role.enum';
import { SignupRequest } from '../dto';
import { smsAuthorization } from '@database/schema/sms_authorization';

type SmsVerifyCreation = {
  phoneNumber: string;
  uniqueKey: string;
  authorizationCode: string;
};

@Injectable()
export class SignupRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return result.length > 0;
  }

  async createUser(createUserDto: SignupRequest) {
    return await this.db.transaction(async (tx) => {
      const profileId = generateUuidV7();
      const userId = generateUuidV7();
      const preferenceId = generateUuidV7();

      const { name, phoneNumber, gender, age, instagramId, birthday } =
        createUserDto;

      const [user] = await tx
        .insert(users)
        .values({
          id: userId,
          phoneNumber,
          name,
          birthday,
          profileId,
          role: Role.USER,
        })
        .returning();

      const profileResult = await tx
        .insert(profiles)
        .values({
          id: profileId,
          userId: user.id,
          name,
          age,
          gender,
          instagramId,
        })
        .returning();

      const profile = profileResult[0];

      await tx
        .insert(schema.userPreferences)
        .values({
          userId: user.id,
          id: preferenceId,
          distanceMax: null,
        })
        .execute();

      return { ...user, profileId: profile.id };
    });
  }

  updateUniversityId(profileId: string, universityId: string) {
    return this.db
      .update(profiles)
      .set({ universityDetailId: universityId })
      .where(eq(profiles.id, profileId))
      .execute();
  }

  async createSmsVerification(data: SmsVerifyCreation) {
    return await this.db
      .insert(smsAuthorization)
      .values({
        id: generateUuidV7(),
        ...data,
      })
      .returning();
  }

  async getAuthorizationCode(uniqueKey: string) {
    return await this.db.query.smsAuthorization.findFirst({
      where: eq(smsAuthorization.uniqueKey, uniqueKey),
    });
  }

  async approveAuthorizationCode(id: string) {
    await this.db
      .update(smsAuthorization)
      .set({ is_authorized: true })
      .where(eq(smsAuthorization.id, id));
  }

  async existsVerifiedSms(phoneNumber: string) {
    const now = sql`NOW()`;
    const minutesAgo = sql`NOW() - INTERVAL '60 minutes'`;

    return await this.db.query.smsAuthorization.findFirst({
      where: and(
        eq(smsAuthorization.phoneNumber, phoneNumber.replaceAll('-', '')),
        eq(smsAuthorization.is_authorized, true),
        isNull(smsAuthorization.deletedAt),
        between(smsAuthorization.createdAt, minutesAgo, now),
      ),
    });
  }

  async isPhoneNumberBlacklisted(phoneNumber: string): Promise<boolean> {
    console.log(`[DEBUG] 블랙리스트 검증 시작 - 입력 전화번호: ${phoneNumber}`);
    const normalizedPhoneNumber = phoneNumber.replaceAll('-', '');
    console.log(`[DEBUG] 정규화된 전화번호: ${normalizedPhoneNumber}`);

    const allUsersWithPhone = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));

    console.log(
      `[DEBUG] 하이픈 포함 전화번호로 찾은 모든 사용자:`,
      JSON.stringify(allUsersWithPhone, null, 2),
    );

    const allUsersWithPhoneNormalized = await this.db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, normalizedPhoneNumber));

    console.log(
      `[DEBUG] 하이픈 제거 전화번호로 찾은 모든 사용자:`,
      JSON.stringify(allUsersWithPhoneNormalized, null, 2),
    );

    const resultWithHyphen = await this.db
      .select()
      .from(users)
      .where(
        and(eq(users.phoneNumber, phoneNumber), isNotNull(users.suspendedAt)),
      )
      .limit(1);

    console.log(
      `[DEBUG] 하이픈 포함 + suspended_at 검색 결과:`,
      JSON.stringify(resultWithHyphen, null, 2),
    );

    // 하이픈 제거된 형태로도 검색
    const resultWithoutHyphen = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.phoneNumber, normalizedPhoneNumber),
          isNotNull(users.suspendedAt),
        ),
      )
      .limit(1);

    console.log(
      `[DEBUG] 하이픈 제거 + suspended_at 검색 결과:`,
      JSON.stringify(resultWithoutHyphen, null, 2),
    );

    const isBlacklisted =
      resultWithHyphen.length > 0 || resultWithoutHyphen.length > 0;
    console.log(`[DEBUG] 블랙리스트 여부: ${isBlacklisted}`);

    return isBlacklisted;
  }

  async existsPhoneNumber(phone: string): Promise<boolean> {
    const results = await this.db
      .select({
        exists: sql`1`,
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.phoneNumber, phone),
          isNull(schema.users.deletedAt),
        ),
      )
      .limit(1);

    return results.length > 0;
  }
}
