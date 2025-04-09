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
    const DELAY_MS = 3000;   // 배치간 지연시간 (1초)
    let totalSuccess = 0;
    let totalFailure = 0;
    // 배치 단위로 분할
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const userBatch = userIds.slice(i, i + BATCH_SIZE);
      
      // 현재 배치 처리
      const matchingFns = userBatch.map(async (userId) => {
        await this.createPartner(userId, 'scheduled', true);
      });
      
      // 현재 배치의 모든 작업 완료 대기
      const fnResults = await Promise.allSettled(matchingFns);
      const successes = fnResults.filter(result => result.status === 'fulfilled');
      totalSuccess += successes.length;
      const failures = fnResults.filter(result => result.status === 'rejected');
      totalFailure += failures.length;

      if (failures.length > 0) {
        const failureMessages = failures.map(data => data.reason);
        this.logger.error(failureMessages);
      }

      const failureMessages = failures.map(data => data.reason).join('\n');

      const now = weekDateService.createDayjs().format('MM월 DD일 HH시 mm분 ss초');
      this.slackService.sendNotification(`
      *[${now}] ${i / BATCH_SIZE + 1}번째 배치 처리 현황*
        성공한 매칭 처리 횟수: ${successes.length},
        실패한 매칭 처리 횟수: ${failures.length}

        \`\`\`${failureMessages}\`\`\`

        실패한매칭이 있다면 어드민 기능을 활용해 마저 처리해주시고, 엔지니어팀은 사태를 파악해 조치해주세요.
      `)
      
      // 마지막 배치가 아니면 지연 추가
      if (i + BATCH_SIZE < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
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
