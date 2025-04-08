import { Injectable, Logger } from "@nestjs/common";
import weekDateService from "../domain/date";
import { MatchingService } from "./matching.service";
import { Similarity } from "@/types/match";
import { choiceRandom } from "../domain/random";
import MatchRepository from "../repository/match.repository";
import { MatchType } from "@/database/schema/matches";
import { Cron } from "@nestjs/schedule";

enum CronFrequency {
  // MATCHING_DAY = '0 0 * * 2,4',
  MATCHING_DAY = '*/1 * * * *',
}

@Injectable()
export default class MatchingCreationService {
  private readonly logger = new Logger(MatchingCreationService.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchRepository: MatchRepository,
  ) {}


  @Cron(CronFrequency.MATCHING_DAY)
  processMatchCentral() {
    this.findAllMatchingUsers();
  }

  async createPartner(userId: string, type: MatchType) {
    const partners = await this.matchingService.findMatches(userId, 30);
    const partner = this.getOnePartner(partners);
    this.logger.debug(`대상 ID: ${userId}, 파트너 ID: ${partner.userId}, 유사도: ${partner.similarity}`);
    await this.createMatch(userId, partner, type);
  }

  private async createMatch(userId: string, partner: Similarity, type: MatchType) {
    const publishedDate = weekDateService.createPublishDate(new Date());
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

  private async findAllMatchingUsers() {
    const BATCH_SIZE = 100;  // 배치 크기
    const DELAY_MS = 1000;   // 배치간 지연시간 (1초)
    
    const users = await this.matchRepository.findAllMatchingUsers();
    
    // 배치 단위로 분할
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      
      // 현재 배치 처리
      const matchingFns = userBatch.map(async (userId) => {
        await this.createPartner(userId, 'scheduled');
      });
      
      // 현재 배치의 모든 작업 완료 대기
      await Promise.allSettled(matchingFns);
      
      // 마지막 배치가 아니면 지연 추가
      if (i + BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
  }

}
