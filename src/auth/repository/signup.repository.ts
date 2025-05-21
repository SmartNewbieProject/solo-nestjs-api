import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { users } from '@database/schema/users';
import { profiles } from '@database/schema/profiles';
import { and, eq, isNull, between, sql } from 'drizzle-orm';
import { InjectDrizzle } from '@common/decorators';
import { generateUuidV7 } from '@database/schema/helper';
import { Role } from '@/auth/domain/user-role.enum';
import { SignupRequest } from '../dto';
import { smsAuthorization } from '@database/schema/sms_authorization';


type SmsVerifyCreation = {
  phoneNumber: string;
  uniqueKey: string;
  authorizationCode: string;
}

@Injectable()
export class SignupRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

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
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return result.length > 0;
  }

  async createUser(createUserDto: SignupRequest) {
    return await this.db.transaction(async (tx) => {
      const profileId = generateUuidV7();
      const userId = generateUuidV7();
      const preferenceId = generateUuidV7();

      const { email, password, name, age, gender, profileImages, phoneNumber, instagramId } = createUserDto;

      const [user] = await tx.insert(users)
        .values({
          id: userId,
          email,
          phoneNumber,
          password,
          name,
          profileId,
          role: Role.USER,
        })
        .returning();

      const [profile] = await tx.insert(profiles)
        .values({
          id: profileId,
          userId: user.id,
          name,
          age,
          gender,
          instagramId,
        })
        .returning();

      if (createUserDto.mbti) {
        await tx.update(profiles)
        .set({
          mbti: createUserDto.mbti,
        })
        .where(eq(profiles.userId, user.id));
      }

      await tx.insert(schema.userPreferences)
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
    return this.db.update(profiles)
      .set({ universityDetailId: universityId })
      .where(eq(profiles.id, profileId))
      .execute();
  }

  async createSmsVerification(data: SmsVerifyCreation) {
    return await this.db.insert(smsAuthorization)
      .values({
        id: generateUuidV7(), ...data,
      })
      .returning();
  }

  async getAuthorizationCode(uniqueKey: string) {
    return await this.db.query.smsAuthorization.findFirst({
      where: eq(smsAuthorization.uniqueKey, uniqueKey),
    });
  }

  async approveAuthorizationCode(id: string) {
    await this.db.update(smsAuthorization)
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
}
