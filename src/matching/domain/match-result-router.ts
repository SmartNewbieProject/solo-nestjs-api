import { MatchDetails, MatchType, RawMatch } from '@/types/match';
import weekDateService from './date';
import { UserProfile } from '@/types/user';
import { Logger } from '@nestjs/common';
import type { Dayjs } from 'dayjs';
import { ElasticDate } from '@/types/common';

type Rematching = {
  endOfView: ElasticDate;
  is: boolean;
};

type MatchingStatus = {
  latestMatch: RawMatch | null;
  onNotFound?: () => Promise<void>;
  onRematching: () => Promise<UserProfile>;
  onOpen: () => Promise<UserProfile>;
};

const watingResponse: MatchDetails = {
  id: null,
  endOfView: null,
  partner: null,
  type: 'waiting',
  untilNext: null,
};

export default class MatchResultRouter {
  private readonly logger = new Logger(MatchResultRouter.name);

  constructor() { }

  async resolveMatchingStatus({ latestMatch, onRematching, onOpen, onNotFound }: MatchingStatus): Promise<MatchDetails> {
    const nextMatchingDate = weekDateService.getNextMatchingDate();

    if (!latestMatch) {
      const earlyView = this.checkEarlyView();
      await onNotFound?.();
      if (earlyView) {
      this.logger.debug(`아직 매칭 전임`);
        return {
          ...watingResponse,
          untilNext: weekDateService.createDayjs(nextMatchingDate).format('YYYY-MM-DD HH:mm:ss'),
        };
      }

      this.logger.debug(`매칭 대상 없음`);
      return {
        id: null,
        endOfView: null,
        partner: null,
        type: 'not-found',
        untilNext: weekDateService.createDayjs(nextMatchingDate).format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    const rematching = this.checkRematchingEligibility(latestMatch);
    if (rematching.is) {
      this.logger.debug(`리매칭 조회됨`);
      return {
        id: latestMatch.id,
        endOfView: rematching.endOfView,
        partner: await onRematching(),
        type: 'rematching',
        untilNext: null,
      };
    }
    const endOfView = weekDateService.createDayjs(latestMatch.expiredAt);

    if (this.checkOver(endOfView)) {
      this.logger.debug(`매칭 대상 시간 만료`);
      this.logger.debug(`endOfView: ${endOfView.format('YYYY-MM-DD HH:mm:ss')} is over`);
      const untilNext = weekDateService.getNextMatchingDate().format('YYYY-MM-DD HH:mm:ss');
      this.logger.debug(`untilNext: ${untilNext}`);
      return {
        ...watingResponse,
        untilNext,
      };
    }

    const publishedDate = weekDateService.createDayjs(latestMatch.publishedAt);
    this.logger.debug(`매칭 대상 공개 기간: ${publishedDate.format('YYYY-MM-DD HH:mm:ss')}`);
    const publishNotAllowed = publishedDate.isAfter(weekDateService.createDayjs());
    if (publishNotAllowed) {
      this.logger.debug(`매칭 대상 공개 전`);
      return {
        ...watingResponse,
        untilNext: weekDateService.createDayjs(nextMatchingDate).format('YYYY-MM-DD HH:mm:ss'),
      }
    }

    this.logger.log(`endOfView: ${endOfView.format('YYYY-MM-DD HH:mm:ss')}`);
    this.logger.debug(`매칭 대상 존재`);
    return {
      id: latestMatch.id,
      endOfView: endOfView.format('YYYY-MM-DD HH:mm:ss'),
      partner: await onOpen(),
      type: 'open',
      untilNext: null,
    }
  }

  checkRematchingEligibility(match: RawMatch): Rematching {
    const endOfView = weekDateService.createDayjs(match.expiredAt);
    // 임시 조치: ADMIN 타입도 publish_at 시간을 확인하도록 변경
    // TODO: 이 임시 조치는 추후 되돌릴 예정입니다. 원래 ADMIN 타입은 즉시 공개되어야 합니다.
    // 원래 코드: const typeCorrected = [MatchType.REMATCHING, MatchType.ADMIN].includes(match.type as MatchType);
    const typeCorrected = match.type === MatchType.REMATCHING;

    return {
      endOfView: endOfView.format('YYYY-MM-DD HH:mm:ss'),
      is: (!this.checkOver(endOfView.toDate()) && typeCorrected),
    };
  }

  checkEarlyView() {
    const { thursday } = weekDateService.getWeekDates();
    const matchingOpenTime = weekDateService.createDayjs(thursday)
      .set('hour', 21);
    return weekDateService.createDayjs().isBefore(matchingOpenTime);
  }

  checkOver(day: Date | Dayjs): boolean {
    return weekDateService.createDayjs().isAfter(day);
  }

}
