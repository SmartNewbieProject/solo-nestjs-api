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
    if (!latestMatch) {
      const earlyView = this.checkEarlyView();
      await onNotFound?.();
      const nextMatchingDate = weekDateService.getNextMatchingDate();
      if (earlyView) {
        return {
          ...watingResponse,
          untilNext: nextMatchingDate.toDate(),
        };
      }

      return {
        id: null,
        endOfView: null,
        partner: null,
        type: 'not-found',
        untilNext: nextMatchingDate.toDate(),
      };
    }

    const rematching = this.checkRematchingEligibility(latestMatch);
    if (rematching.is) {
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
      this.logger.debug(`endOfView: ${endOfView.format('YYYY-MM-DD HH:mm:ss')} is over`);
      const untilNext = weekDateService.getNextMatchingDate().format('YYYY-MM-DD HH:mm:ss');
      this.logger.debug(`untilNext: ${untilNext}`);
      return {
        ...watingResponse,
        untilNext,
      };
    }

    this.logger.log(`endOfView: ${endOfView.format('YYYY-MM-DD HH:mm:ss')}`);
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
    const typeCorrected = [MatchType.REMATCHING, MatchType.ADMIN].includes(match.type as MatchType);

    return {
      endOfView: endOfView.format('YYYY-MM-DD HH:mm:ss'),
      is: (!this.checkOver(endOfView.toDate()) && typeCorrected),
    };
  }

  checkEarlyView() {
    const { thursday } = weekDateService.getWeekDates();
    return weekDateService.createDayjs().isBefore(thursday);
  }

  checkOver(day: Date | Dayjs): boolean {
    return weekDateService.createDayjs().isAfter(day);
  }

}
