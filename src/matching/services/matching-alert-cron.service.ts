import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from '@/common/services/mail.service';
import UserRepository from '@/user/repository/user.repository';

@Injectable()
export class MatchingAlertCronService {
  private readonly logger = new Logger(MatchingAlertCronService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
  ) {}

  // 매주 목요일, 일요일 12:00
  @Cron('0 14 * * 4,0')
  async sendMatchingAlertToAllUsers() {
    const users = await this.userRepository.findAllActiveUsers();
    const pLimit = (await import('p-limit')).default;
    const limit = pLimit(15);

    const tasks = users.map(user =>
      limit(() =>
        this.mailService.sendMatchingAlertEmail(user.email, user.name)
          .catch(e => this.logger.error(`Failed to send to ${user.email}: ${e.message}`))
      )
    );

    await Promise.all(tasks);
    this.logger.log(`매칭 알림 이메일 발송 완료: ${users.length}명`);
  }
} 