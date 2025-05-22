import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * 회원가입 환영 이메일을 전송합니다.
   * @param to 수신자 이메일
   * @param name 수신자 이름
   * @param data 추가 데이터
   */
  async sendWelcomeEmail(to: string, name: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: `${name}님, 썸타임 회원가입을 축하합니다!`,
        template: 'welcome',
        context: {
          user_name: name,
          email: to,
        },
      });
      this.logger.log(`Welcome email sent to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
      throw error;
    }
  }

  /**
   * 사전 회원 신청 안내 이메일을 전송합니다.
   * @param to 수신자 이메일
   * @param name 수신자 이름
   * @param data 추가 데이터
   */
  async sendPreSignupEmail(to: string, name: string, data: any = {}) {
    const baseUrl = this.configService.get('BASE_URL', 'https://some-in-univ.com');
    const supportEmail = this.configService.get('SUPPORT_EMAIL', 'notify@smartnewb.com');
    const supportPhone = this.configService.get('SUPPORT_PHONE', '070-8065-4387');
    const currentYear = new Date().getFullYear();

    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: `${name}님, 썸타임 얼리버드 등록을 축하합니다!`,
        template: 'pre-signup',
        context: {
          name,
          email: to,
          university: data.universityName || '대학교',
          signupDate: new Date().toLocaleDateString('ko-KR'),
          loginUrl: `${baseUrl}/auth/login`,
          supportEmail,
          supportPhone,
          currentYear,
          ...data,
        },
      });

      this.logger.log(`Pre-signup email sent to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send pre-signup email to ${to}`, error);
      throw error;
    }
  }

  async sendMatchingAlertEmail(to: string, name: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: `${name}님, 오늘 밤 9시 새로운 인연을 만나보세요!`,
        template: 'matching-alert',
        context: {
          user_name: name,
          email: to,
        },
      });
      this.logger.log(`Matching alert email sent to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send matching alert email to ${to}`, error);
      throw error;
    }
  }
}
