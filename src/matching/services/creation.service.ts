import { Injectable, Logger } from "@nestjs/common";
import weekDateService from "../domain/date";
import { MatchingService } from "./matching.service";
import { Similarity } from "@/types/match";
import { choiceRandom } from "../domain/random";
import MatchRepository from "../repository/match.repository";
import { MatchType } from "@/database/schema/matches";
import { Cron } from "@nestjs/schedule";
import { SlackService } from "@/slack-notification/slack.service";
import ProfileRepository from "@/user/repository/profile.repository";
import { ProfileService } from "@/user/services/profile.service";
import { Cache } from "@nestjs/cache-manager";

enum CronFrequency {
  // MATCHING_DAY = '0 0 * * 2,4',
  MATCHING_DAY = '10 23 * * *',
}

@Injectable()
export default class MatchingCreationService {
  private readonly logger = new Logger(MatchingCreationService.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchRepository: MatchRepository,
    private readonly profileService: ProfileService,
    private readonly slackService: SlackService,
    private readonly cacheManager: Cache,
  ) {}


  @Cron(CronFrequency.MATCHING_DAY)
  async processMatchCentral() {
    const userIds = await this.findAllMatchingUsers();
    this.slackService.sendNotification(`${userIds.length} 명의 매칭처리를 시작합니다.`);
    await this.batch(userIds);
  } 

  async createPartner(userId: string, type: MatchType, isBatch: boolean = false) {
    const partners = await this.matchingService.findMatches(userId, 10);
    if (partners.length === 0) {
      this.logger.debug(`대상 ID: ${userId}, 파트너 ID: 없음, 유사도: 0`);
      return;
    }
    const partner = this.getOnePartner(partners);
    const requester = await this.profileService.getUserProfiles(userId);
    const matcher = await this.profileService.getUserProfiles(partner.userId);

    if (!isBatch) {
    await this.slackService.sendSingleMatch(
      requester,
      matcher,
      partner.similarity,
      type
    );
  }

    await this.createMatch(userId, partner, type);
  }

  private async createMatch(userId: string, partner: Similarity, type: MatchType) {
    const publishedDate = weekDateService.createPublishDate(weekDateService.createDayjs());
    await this.matchRepository.createMatch(
      userId,
      partner.userId,
      partner.similarity,
      publishedDate,
      'scheduled',
    );
  }

  private getOnePartner(partners: Similarity[]) {
    return choiceRandom(partners);
  }

  findAllMatchingUsers() {
    return this.matchRepository.findAllMatchingUsers();
  }

  async batch(userIds: string[]) {
    this.cacheManager.del('matching:total-count');
    
    const PROCESS_DELAY_MS = 120; 
    const totalUsers = userIds.length;
    const notificationInterval = Math.ceil(totalUsers * 0.05); // 5%에 해당하는 사용자 수
    let totalSuccess = 0;
    let totalFailure = 0;
    const results = [] as { status: string, reason?: any }[];

    for (let i = 0; i < totalUsers; i++) {
      const userId = userIds[i];
      try {
        await this.createPartner(userId, 'scheduled', true);
        results.push({ status: 'fulfilled' });
        totalSuccess++;
      } catch (error) {
        results.push({ status: 'rejected', reason: error });
        this.slackService.sendNotification(`${userId} 매칭 처리 실패\n\`\`\`${JSON.stringify(error, null, 2)}\`\`\``);
        totalFailure++;
        this.logger.error(error);
      }
      await this.sleep(PROCESS_DELAY_MS);

      // 5%씩 처리할 때마다 알림 전송
      if ((i + 1) % notificationInterval === 0 || i === totalUsers - 1) {
        const now = weekDateService.createDayjs().format('MM월 DD일 HH시 mm분 ss초');
        this.slackService.sendNotification(`
          [${now}] 현재까지 처리된 사용자 수: ${i + 1}/${totalUsers}
          성공한 매칭 처리 횟수: ${totalSuccess},
          실패한 매칭 처리 횟수: ${totalFailure}
        `);
      }
    }

    const now = weekDateService.createDayjs().format('MM월 DD일 HH시 mm분 ss초');
    this.slackService.sendNotification(`
      [${now}] 배치가 완료되었습니다.
      총 처리된 개수: ${totalUsers},
      성공한 개수: ${totalSuccess}
      실패한 개수: ${totalFailure}
    `);
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
