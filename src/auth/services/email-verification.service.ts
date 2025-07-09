import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MailService } from '@/common/services/mail.service';
import { AuthRepository } from '../repository/auth.repository';
import { generateVerificationCode } from '../domain/code-generator';
import {
  isValidUniversityEmail,
  getUniversityNameFromEmail,
} from '@/shared/libs/univ';
import {
  SendEmailVerificationRequest,
  VerifyEmailCodeRequest,
  SendEmailVerificationResponse,
  VerifyEmailCodeResponse,
} from '../dto/email-verification.dto';

interface EmailVerificationData {
  email: string;
  verificationCode: string;
  createdAt: number;
  verifiedAt?: number;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly mailService: MailService,
    private readonly authRepository: AuthRepository,
  ) {}

  async sendVerificationCode(
    request: SendEmailVerificationRequest,
  ): Promise<SendEmailVerificationResponse> {
    const { email } = request;
    const normalizedEmail = email.toLowerCase();

    if (!isValidUniversityEmail(normalizedEmail)) {
      this.logger.warn(`허용되지 않은 대학교 이메일 시도: ${normalizedEmail}`);
      throw new BadRequestException('허용되지 않은 대학교 이메일입니다.');
    }

    const recentKey = `email_verification_recent:${normalizedEmail}`;
    const recentVerification = await this.cacheManager.get(recentKey);

    if (recentVerification) {
      this.logger.warn(`중복 인증번호 발송 시도: ${normalizedEmail}`);
      throw new BadRequestException(
        '이미 인증번호가 발송되었습니다. 3분 후에 다시 시도해주세요.',
      );
    }

    const verificationCode = generateVerificationCode();
    const universityName = getUniversityNameFromEmail(normalizedEmail);

    const verificationData: EmailVerificationData = {
      email: normalizedEmail,
      verificationCode,
      createdAt: Date.now(),
    };

    const verificationKey = `email_verification:${normalizedEmail}`;
    await this.cacheManager.set(
      verificationKey,
      verificationData,
      3 * 60 * 1000,
    ); // 3분
    await this.cacheManager.set(recentKey, true, 3 * 60 * 1000);

    try {
      await this.mailService.sendUniversityVerificationEmail(
        normalizedEmail,
        verificationCode,
        universityName as string,
      );

      this.logger.log(`이메일 인증번호 발송 완료: ${normalizedEmail}`);
    } catch (error) {
      this.logger.error(`이메일 발송 실패: ${normalizedEmail}`, error);
      throw new BadRequestException(
        '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    return {
      message: '인증번호가 이메일로 발송되었습니다.',
      expiresInMinutes: 3,
    };
  }

  async verifyCode(
    request: VerifyEmailCodeRequest,
  ): Promise<VerifyEmailCodeResponse> {
    const { email, verificationCode, profileId } = request;
    const normalizedEmail = email.toLowerCase();

    if (!isValidUniversityEmail(normalizedEmail)) {
      throw new BadRequestException('허용되지 않은 대학교 이메일입니다.');
    }

    const verificationKey = `email_verification:${normalizedEmail}`;
    const verificationData =
      await this.cacheManager.get<EmailVerificationData>(verificationKey);

    if (!verificationData) {
      throw new NotFoundException(
        '인증 정보를 찾을 수 없거나 유효시간이 만료되었습니다.',
      );
    }

    if (verificationData.verifiedAt) {
      throw new BadRequestException('이미 인증이 완료된 코드입니다.');
    }

    if (verificationData.verificationCode !== verificationCode) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }

    verificationData.verifiedAt = Date.now();
    await this.cacheManager.set(
      verificationKey,
      verificationData,
      3 * 60 * 1000,
    );

    if (profileId) {
      try {
        await this.authRepository.updateEmailVerification(
          profileId,
          verificationData.email,
        );

        this.logger.log(
          `이메일 정보 업데이트 완료 (profileId: ${profileId}): ${verificationData.email}`,
        );
      } catch (error) {
        this.logger.error(
          `이메일 정보 업데이트 실패: ${verificationData.email}`,
          error,
        );
      }
    }

    const universityName = getUniversityNameFromEmail(verificationData.email);

    this.logger.log(`이메일 인증 완료: ${verificationData.email}`);

    return {
      success: true,
      message: '이메일 인증이 완료되었습니다.',
      email: verificationData.email,
      universityName: universityName as string,
    };
  }
}
