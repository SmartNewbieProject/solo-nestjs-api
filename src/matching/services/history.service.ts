import { UserProfile } from "@/types/user";
import { BadRequestException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { MatchHistoryRepository } from "../repository/history.repository";
import weekDateService, { matchingDayUtils } from "../domain/date";
import { ProfileService } from "@/user/services/profile.service";

@Injectable()
export class MatchHistoryService {
  private readonly logger = new Logger(MatchHistoryService.name);

  constructor(
    private readonly matchHistoryRepository: MatchHistoryRepository,
    private readonly profileService: ProfileService,
  ) { }

  async getHistory(matchId: string): Promise<UserProfile> {
    const match = await this.matchHistoryRepository.getMatch(matchId);
    if (!match || !match.matcherId) {
      throw new NotFoundException('매칭 내역을 찾을 수 없습니다.');
    }
    const endOfView = matchingDayUtils.getEndOfView(match.publishedAt);
    this.logger.debug(`endOfView: ${endOfView.format('YYYY-MM-DD HH:mm:ss')}`)
    this.logger.debug(`now: ${weekDateService.createDayjs().format('YYYY-MM-DD HH:mm:ss')}`)
    const now = weekDateService.createDayjs();

    const isOverDate = now.isAfter(endOfView);
    if (isOverDate) {
      throw new BadRequestException('매칭 기간이 지났습니다.');
    }

    return await this.profileService.getUserProfiles(match.matcherId);
  }

}
