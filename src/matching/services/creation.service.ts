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
import { ProfileSummary } from "@/types/user";
import { ProfileService } from "@/user/services/profile.service";

enum CronFrequency {
  // MATCHING_DAY = '0 0 * * 2,4',
  MATCHING_DAY = '* */6 * * *',
}

@Injectable()
export default class MatchingCreationService {
  private readonly logger = new Logger(MatchingCreationService.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchRepository: MatchRepository,
    private readonly profileRepository: ProfileRepository,  
    private readonly profileService: ProfileService,
    private readonly slackService: SlackService,
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
    const BATCH_SIZE = 50;  // 배치 크기
    const BATCH_DELAY_MS = 3000;   // 배치간 지연시간 (3초)
    const PROCESS_DELAY_MS = 100;  // 프로세스간 지연시간 (100ms)
    let totalSuccess = 0;
    let totalFailure = 0;

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const userBatch = userIds.slice(i, i + BATCH_SIZE);
      const results = [] as { status: string, reason?: any }[];
      
      // 각 프로세스를 순차적으로 실행하면서 지연시간 추가
      for (const userId of userBatch) {
        try {
          await this.createPartner(userId, 'scheduled', true);
          results.push({ status: 'fulfilled' });
          totalSuccess++;
        } catch (error) {
          results.push({ status: 'rejected', reason: error });
          totalFailure++;
          this.logger.error(error);
        }
        // 각 프로세스 사이에 지연시간 추가
        await new Promise(resolve => setTimeout(resolve, PROCESS_DELAY_MS));
      }

      const successes = results.filter(result => result.status === 'fulfilled');
      const failures = results.filter(result => result.status === 'rejected');

      const failureMessages = failures.map(data => data.reason).join('\n');

      const now = weekDateService.createDayjs().format('MM월 DD일 HH시 mm분 ss초');
      this.slackService.sendNotification(`
      *[${now}] ${i / BATCH_SIZE + 1}번째 배치 처리 현황*
        성공한 매칭 처리 횟수: ${successes.length},
        실패한 매칭 처리 횟수: ${failures.length}

        \`\`\`${failureMessages}\`\`\`

        실패한매칭이 있다면 어드민 기능을 활용해 마저 처리해주시고, 엔지니어팀은 사태를 파악해 조치해주세요.
      `);
      
      // 배치 간 지연시간 추가
      if (i + BATCH_SIZE < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const now = weekDateService.createDayjs().format('MM월 DD일 HH시 mm분 ss초');
    this.slackService.sendNotification(`
      [${now}] 배치가 완료되었습니다.
      총 처리된 개수: ${userIds.length},
      성공한 개수: ${totalSuccess}
      실패한 개수: ${totalFailure}
    `);
  }

}
