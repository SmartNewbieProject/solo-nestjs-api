import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import weekDateService from '../domain/date';
import { MatchingService } from './matching.service';
import { MatchType, Similarity, TicketType } from '@/types/match';
import MatchRepository from '../repository/match.repository';
import { Cron } from '@nestjs/schedule';
import { SlackService } from '@/slack-notification/slack.service';
import { ProfileService } from '@/user/services/profile.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { TicketService } from '@/payment/services/ticket.service';
import { MatchingFailureLogService } from './matching-failure-log.service';
import { weightedRandomChoice } from '../domain/partner-selector';
import { MatchingStatsService } from './stats.service';
import { MatchUserHistoryManager } from '../domain/match-user-history';

enum CronFrequency {
  // MATCHING_DAY = '0 0 * * 2,4',
  MATCHING_DAY = '0 0 * * 4,0',
  // MATCHING_DAY = '*/1 * * * *'
}

@Injectable()
export default class MatchingCreationService {
  private readonly logger = new Logger(MatchingCreationService.name);
  private readonly LOCK_KEY = 'matching:creation:lock';

  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchRepository: MatchRepository,
    private readonly profileService: ProfileService,
    private readonly slackService: SlackService,
    private readonly ticketService: TicketService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly matchingFailureLogService: MatchingFailureLogService,
    private readonly statsService: MatchingStatsService,
    private readonly matchUserHistoryManager: MatchUserHistoryManager,
  ) {}

  @Cron(CronFrequency.MATCHING_DAY, {
    name: 'processMatchCentral',
    timeZone: 'Asia/Seoul',
  })
  async processMatchCentral() {
    const batchEnable = (await this.cacheManager.get('batchStatus')) as string;
    this.logger.debug(
      `batchEnable: ${batchEnable}, type: ${typeof batchEnable}`,
    );
    if (!batchEnable || batchEnable === 'false') {
      this.logger.debug(`배치 매칭 비활성화`);
      return;
    }

    const isLocked = (await this.cacheManager.get(this.LOCK_KEY)) as boolean;
    this.logger.debug(`isLocked: ${isLocked}`);
    if (isLocked) {
      this.logger.debug(`매칭 처리 진행중`);
      return;
    }
    const oneHourInMs = 1 * 60 * 60 * 1000;
    await this.cacheManager.set(this.LOCK_KEY, true, oneHourInMs);
    const userIds = await this.findAllMatchingUsers();
    this.slackService.sendNotification(
      `${userIds.length} 명의 매칭처리를 시작합니다.`,
    );
    const result = await this.batch(userIds);
    return result;
  }

  async rematch(userId: string) {
    try {
      // 재매칭권 확인
      const ticket = await this.ticketService.getAvailableTicket(
        userId,
        TicketType.REMATCHING,
      );
      if (!ticket) {
        throw new ForbiddenException('재매칭권이 없습니다.');
      }

      // 매칭 시도
      const result = await this.createPartner(userId, MatchType.REMATCHING);
      if (!result.success) {
        // 매칭 실패 로그 저장 (이미 createPartner 내부에서 저장되지만, 추가 정보를 위해 여기서도 저장)
        await this.matchingFailureLogService.logMatchingFailure(
          userId,
          '재매칭 요청 시 매칭상대를 찾을 수 없음',
        );

        // 재매칭 실패 시 추가 슬랙 알림 전송
        try {
          const userProfile = await this.profileService.getUserProfiles(userId);
          const failureMessage = `❌ 재매칭 실패 알림\n사용자: ${userProfile.name} (ID: ${userId})\n이유: 재매칭 요청 시 매칭상대를 찾을 수 없음`;
          await this.slackService.sendNotification(failureMessage);
        } catch (error) {
          this.logger.error(
            `재매칭 실패 슬랙 알림 전송 중 오류 발생: ${error.message}`,
            error.stack,
          );
        }

        throw new NotFoundException('매칭상대를 찾을 수 없습니다.');
      }

      // 매칭 성공 시 티켓 사용 처리
      await this.ticketService.useTicket(ticket.id);

      return result;
    } catch (error) {
      // ForbiddenException(재매칭권 없음)과 NotFoundException(매칭상대 없음)은 그대로 전파
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // 그 외 예외는 로그 저장 및 슬랙 알림 전송 후 NotFoundException으로 변환
      this.logger.error(
        `재매칭 처리 중 오류 발생: ${error.message}`,
        error.stack,
      );

      // 매칭 실패 로그 저장
      await this.matchingFailureLogService.logMatchingFailure(
        userId,
        `재매칭 처리 중 오류 발생: ${error.message}`,
      );

      // 슬랙 알림 전송
      try {
        let userName = '알 수 없음';
        try {
          const userProfile = await this.profileService.getUserProfiles(userId);
          userName = userProfile.name;
        } catch (profileError) {
          this.logger.error(`사용자 프로필 조회 중 오류 발생: ${profileError}`);
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const failureMessage = `❌ 재매칭 처리 중 오류 발생\n사용자: ${userName} (ID: ${userId})\n이유: ${errorMessage}`;
        await this.slackService.sendNotification(failureMessage);
      } catch (slackError) {
        this.logger.error(`슬랙 알림 전송 중 오류 발생: ${slackError}`);
      }

      throw new NotFoundException('매칭 처리 중 오류가 발생했습니다.');
    }
  }

  async createPartner(
    userId: string,
    type: MatchType,
    isBatch: boolean = false,
  ) {
    try {
      // 매칭 가능한 파트너 찾기
      const partners = await this.matchingService.findMatches(userId, 10, type);
      if (partners.length === 0) {
        this.logger.debug(`대상 ID: ${userId}, 파트너 ID: 없음, 유사도: 0`);

        await this.matchingFailureLogService.logMatchingFailure(
          userId,
          '적합한 매칭 파트너를 찾을 수 없음',
        );

        // TODO: 리팩터링 필요.. 핵심 기능에 보조적인 코드가 너무 김. 하나의 액션으로 대체 가능해보임
        // 매칭 실패 시 슬랙 알림 전송
        try {
          const userProfile = await this.profileService.getUserProfiles(userId);
          const failureMessage = `❌ 매칭 실패 알림\n사용자: ${userProfile.name} (ID: ${userId})\n이유: 적합한 매칭 파트너를 찾을 수 없음`;
          await this.slackService.sendNotification(failureMessage);
        } catch (error) {
          this.logger.error(`매칭 실패 슬랙 알림 전송 중 오류 발생: ${error}`);
        }

        return { success: false, partner: null, requester: null };
      }

      // 파트너 선택 및 매칭 생성
      const partner = weightedRandomChoice(partners);
      if (!partner) {
        throw new NotFoundException('적합한 매칭 파트너를 찾을 수 없음');
      }
      await this.statsService.incrementMatchCount(partner.userId);
      try {
        const requester = await this.profileService.getUserProfiles(
          userId,
          false,
        );
        const matcher = await this.profileService.getUserProfiles(
          partner.userId,
          false,
        );
        await this.matchUserHistoryManager.addMatchedUser(
          requester.id,
          matcher.id,
          matcher.name,
        );

        if (!isBatch) {
          await this.slackService.sendSingleMatch(
            requester,
            matcher,
            partner.similarity,
            type,
          );
        }

        // 상대도 매칭 데이터를 생성
        if (type === MatchType.SCHEDULED) {
          await this.createMatch(
            partner.userId,
            {
              userId,
              similarity: partner.similarity,
            },
            type,
          );
        }

        await this.createMatch(userId, partner, type);
        return {
          success: true,
          partner: matcher,
          requester: requester,
          similarity: partner.similarity,
        };
      } catch (error) {
        // 프로필 조회 또는 매칭 생성 중 오류 발생 시 로그 저장
        this.logger.error(
          `매칭 생성 중 오류 발생: ${error.message}`,
          error.stack,
        );
        await this.matchingFailureLogService.logMatchingFailure(
          userId,
          `매칭 생성 중 오류 발생: ${error.message}`,
        );

        // 슬랙 알림 전송
        try {
          let userName = '알 수 없음';
          try {
            const userProfile =
              await this.profileService.getUserProfiles(userId);
            userName = userProfile.name;
          } catch (profileError) {
            // 프로필 조회 실패 시 무시하고 계속 진행
          }

          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const failureMessage = `❌ 매칭 생성 중 오류 발생\n사용자: ${userName} (ID: ${userId})\n이유: ${errorMessage}`;
          await this.slackService.sendNotification(failureMessage);
        } catch (slackError) {
          this.logger.error(
            `슬랙 알림 전송 중 오류 발생: ${slackError.message}`,
            slackError.stack,
          );
        }

        return {
          success: false,
          partner: null,
          requester: null,
          error: error.message,
        };
      }
    } catch (error) {
      // 예상치 못한 오류 발생 시 로그 저장
      this.logger.error(
        `매칭 처리 중 예상치 못한 오류 발생: ${error.message}`,
        error.stack,
      );
      await this.matchingFailureLogService.logMatchingFailure(
        userId,
        `매칭 처리 중 예상치 못한 오류 발생: ${error.message}`,
      );

      // 슬랙 알림 전송x`
      try {
        let userName = '알 수 없음';
        try {
          const userProfile = await this.profileService.getUserProfiles(userId);
          userName = userProfile.name;
        } catch (profileError) {
          // 프로필 조회 실패 시 무시하고 계속 진행
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const failureMessage = `❌ 매칭 처리 중 예상치 못한 오류 발생\n사용자: ${userName} (ID: ${userId})\n이유: ${errorMessage}`;
        await this.slackService.sendNotification(failureMessage);
      } catch (slackError) {
        this.logger.error(
          `슬랙 알림 전송 중 오류 발생: ${slackError.message}`,
          slackError.stack,
        );
      }

      return {
        success: false,
        partner: null,
        requester: null,
        error: error.message,
      };
    }
  }

  private async createMatch(
    userId: string,
    partner: Similarity,
    type: MatchType,
  ) {
    const publishedDate = (() => {
      // REMATCHING과 ADMIN 타입은 즉시 공개
      if ([MatchType.REMATCHING, MatchType.ADMIN].includes(type)) {
        return weekDateService.createDayjs().toDate();
      }
      // SCHEDULED 타입은 나중에 공개되도록 설정
      return weekDateService.createPublishDate(weekDateService.createDayjs());
    })();

    this.logger.log(
      `published date: ${weekDateService.createDayjs(publishedDate).format('YYYY-MM-DD HH:mm:ss')}`,
    );

    await this.matchRepository.createMatch(
      userId,
      partner.userId,
      partner.similarity,
      publishedDate,
      type,
    );
  }

  findAllMatchingUsers() {
    return this.matchRepository.findAllMatchingUsers();
  }

  findScheduledFemaleCandidates() {
    return this.matchRepository.findScheduledFemaleCandidates();
  }

  async batch(userIds: string[]) {
    this.cacheManager.del('matching:total-count');

    const PROCESS_DELAY_MS = 120;
    const totalUsers = userIds.length;
    const notificationInterval = Math.ceil(totalUsers * 0.05); // 5%에 해당하는 사용자 수
    let totalSuccess = 0;
    let totalFailure = 0;
    const results = [] as { status: string; reason?: any }[];

    for (let i = 0; i < totalUsers; i++) {
      const userId = userIds[i];
      try {
        const result = await this.createPartner(
          userId,
          MatchType.SCHEDULED,
          true,
        );
        if (result.success) {
          results.push({ status: 'fulfilled' });
          totalSuccess++;
        } else {
          results.push({
            status: 'rejected',
            reason: result.error || '매칭 실패',
          });
          totalFailure++;

          // 매칭 실패 로그는 이미 createPartner 내부에서 저장됨
        }
      } catch (error) {
        results.push({ status: 'rejected', reason: error });

        // 매칭 실패 로그 저장
        await this.matchingFailureLogService.logMatchingFailure(
          userId,
          `매칭 처리 중 오류 발생: ${error.message}`,
        );

        // 매칭 실패 시 슬랙 알림 전송 (더 자세한 정보 포함)
        try {
          const userProfile = await this.profileService.getUserProfiles(userId);
          const failureMessage = `❌ 배치 매칭 실패 알림\n사용자: ${userProfile?.name || '알 수 없음'} (ID: ${userId})\n이유: 매칭 처리 중 오류 발생\n\`\`\`${JSON.stringify(error, null, 2)}\`\`\``;
          await this.slackService.sendNotification(failureMessage);
        } catch (slackError) {
          // 슬랙 알림 전송 실패 시 기본 메시지로 전송 시도
          await this.slackService.sendNotification(
            `${userId} 매칭 처리 실패\n\`\`\`${JSON.stringify(error, null, 2)}\`\`\``,
          );
          this.logger.error(
            `매칭 실패 슬랙 알림 전송 중 오류 발생: ${slackError.message}`,
            slackError.stack,
          );
        }

        totalFailure++;
        this.logger.error(error);
      }
      await this.sleep(PROCESS_DELAY_MS);

      // 5%씩 처리할 때마다 알림 전송
      if ((i + 1) % notificationInterval === 0 || i === totalUsers - 1) {
        const now = weekDateService
          .createDayjs()
          .format('MM월 DD일 HH시 mm분 ss초');
        this.slackService.sendNotification(`
          [${now}] 현재까지 처리된 사용자 수: ${i + 1}/${totalUsers}
          성공한 매칭 처리 횟수: ${totalSuccess},
          실패한 매칭 처리 횟수: ${totalFailure}
        `);
      }
    }

    const now = weekDateService
      .createDayjs()
      .format('MM월 DD일 HH시 mm분 ss초');
    this.slackService.sendNotification(`
      [${now}] 배치가 완료되었습니다.
      총 처리된 개수: ${totalUsers},
      성공한 개수: ${totalSuccess}
      실패한 개수: ${totalFailure}
    `);

    this.cacheManager.del(this.LOCK_KEY);

    return {
      totalUsers,
      totalSuccess,
      totalFailure,
      results,
    };
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async matchRestMembers() {
    const { thursday, sunday } = weekDateService.getWeekDates();
    const now = weekDateService.createDayjs();
    const isThursdayBefore = now.isBefore(thursday);
    if (isThursdayBefore) {
      throw new BadRequestException(
        '목요일 이전에는 매칭을 진행할 수 없습니다.',
      );
    }

    if (now.isAfter(thursday, 'day') && now.isBefore(sunday, 'day')) {
      throw new BadRequestException(
        '일요일 이전에는 매칭을 진행할 수 없습니다.',
      );
    }

    const users = await this.matchRepository.findRestMembers();
    this.logger.log({ usersCount: users.length });

    // TODO: 배압 처리필요.
    const results: any[] = [];
    for (const user of users) {
      await this.sleep(200);
      results.push(
        await this.createPartner(user.id, MatchType.SCHEDULED, true),
      );
    }

    return {
      totalProcessed: users.length,
      results,
    };
  }
}
