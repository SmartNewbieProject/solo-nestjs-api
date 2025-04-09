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

enum CronFrequency {
  MATCHING_DAY = '0 0 * * 2,4',
  // MATCHING_DAY = '*/1 * * * *',
}

@Injectable()
export default class MatchingCreationService {
  private readonly logger = new Logger(MatchingCreationService.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchRepository: MatchRepository,
    private readonly profileRepository: ProfileRepository,  
    private readonly slackService: SlackService,
  ) {}


  @Cron(CronFrequency.MATCHING_DAY)
  async processMatchCentral() {
    const userIds = await this.findAllMatchingUsers();
    this.slackService.sendNotification(`${userIds.length} 명의 매칭처리를 시작합니다.`);
    await this.batch(userIds);
  }

  async createPartner(userId: string, type: MatchType) {
    const partners = await this.matchingService.findMatches(userId, 10);
    if (partners.length === 0) {
      this.logger.debug(`대상 ID: ${userId}, 파트너 ID: 없음, 유사도: 0`);
      return;
    }
    const partner = this.getOnePartner(partners);
    const requester = await this.profileRepository.getProfileSummary(userId) as ProfileSummary;
    const matcher = await this.profileRepository.getProfileSummary(partner.userId) as ProfileSummary;

    // 기존 텍스트 메시지 대신 새로운 블록 메시지 사용
    await this.slackService.sendSingleMatch(
      requester,
      matcher,
      partner.similarity,
      type
    );

    this.logger.debug(`대상 ID: ${userId}, 파트너 ID: ${partner.userId}, 유사도: ${partner.similarity}`);
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
    const BATCH_SIZE = 100;  // 배치 크기
    const DELAY_MS = 3000;   // 배치간 지연시간 (1초)
    // 배치 단위로 분할
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const userBatch = userIds.slice(i, i + BATCH_SIZE);
      
      // 현재 배치 처리
      const matchingFns = userBatch.map(async (userId) => {
        await this.createPartner(userId, 'scheduled');
      });
      
      // 현재 배치의 모든 작업 완료 대기
      await Promise.allSettled(matchingFns);
      
      // 마지막 배치가 아니면 지연 추가
      if (i + BATCH_SIZE < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
  }

}
