import { MatchDetails, MatchType, RawMatch } from '@/types/match';
import weekDateService from './date';
import { UserProfile } from '@/types/user';

type Rematching = {
  endOfView: Date;
  is: boolean;
};

type MatchingStatus = {
  latestMatch: RawMatch | null;
  onNotFound?: () => Promise<void>;
  onRematching: () => Promise<UserProfile>;
  onOpen: () => Promise<UserProfile>;
};

const watingResponse: MatchDetails = {
  endOfView: null,
  partner: null,
  type: 'waiting',
};

export default class MatchResultRouter {
  constructor() { }

  async resolveMatchingStatus({ latestMatch, onRematching, onOpen, onNotFound }: MatchingStatus): Promise<MatchDetails> {
    if (!latestMatch) {
      const earlyView = this.checkEarlyView();
      await onNotFound?.();
      if (earlyView) {
        return watingResponse;
      }
      return {
        endOfView: null,
        partner: null,
        type: 'not-found',
      };
    }

    const rematching = this.checkRematchingEligibility(latestMatch);
    if (rematching.is) {
      return {
        endOfView: rematching.endOfView,
        partner: await onRematching(),
        type: 'rematching',
      };
    }
    const publishedDate = weekDateService.createDayjs(latestMatch.publishedAt!);
    const endOfView = this.getEndOfView(publishedDate.toDate()).toDate();

    if (this.checkOver(endOfView)) {
      return watingResponse;
    }

    return {
      endOfView,
      partner: await onOpen(),
      type: 'open',
    }
  }

  checkRematchingEligibility(match: RawMatch): Rematching {
    const endOfView = this.getEndOfView(match.publishedAt);
    const typeCorrected = [MatchType.REMATCHING, MatchType.ADMIN].includes(match.type as MatchType);

    return {
      endOfView: endOfView.toDate(),
      is: (!this.checkOver(endOfView.toDate()) && typeCorrected),
    };
  }

  checkEarlyView() {
    const { thursday } = weekDateService.getWeekDates();
    return weekDateService.createDayjs().isBefore(thursday);
  }

  checkOver(day: Date): boolean {
    return weekDateService.createDayjs().isAfter(day);
  }

  getEndOfView(d: Date) {
    const day = weekDateService.createDayjs(d);
    return day
      .add(2, 'day')
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
  }

}
