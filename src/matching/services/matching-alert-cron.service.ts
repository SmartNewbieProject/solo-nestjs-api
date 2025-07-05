import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from '@/common/services/mail.service';
import UserRepository from '@/user/repository/user.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class MatchingAlertCronService {
  private readonly logger = new Logger(MatchingAlertCronService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
    private readonly cacheManager: Cache,
  ) {}

  // 매주 목요일, 일요일 12:00
  @Cron('0 12 * * 4,0')
  async sendMatchingAlertToAllUsers() {
    const users = await this.userRepository.findAllActiveUsers();
    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(15);
    const batchEnable = await this.cacheManager.get('mailBatchStatus');
    if (batchEnable) {
      return;
    }

    const tasks = users
      .filter(user => user.email) // email이 있는 사용자만 필터링
      .map(user =>
        limit(() =>
          this.mailService.sendMatchingAlertEmail(user.email!, user.name)
            .catch(e => this.logger.error(`Failed to send to ${user.email}: ${e.message}`))
        )
      );

    await this.cacheManager.set('mailBatchStatus', true, 1000 * 60 * 60 * 3);

    await Promise.all(tasks);
    this.logger.log(`매칭 알림 이메일 발송 완료: ${users.length}명`);
  }
}
