import { MatchDetails, MatchType, RawMatch } from '@/types/match';
import weekDateService, { matchingDayUtils } from './date';
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
  id: null,
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
        id: null,
        endOfView: null,
        partner: null,
        type: 'not-found',
      };
    }

    const rematching = this.checkRematchingEligibility(latestMatch);
    if (rematching.is) {
      return {
        id: latestMatch.id,
        endOfView: rematching.endOfView,
        partner: await onRematching(),
        type: 'rematching',
      };
    }
    const publishedDate = weekDateService.createDayjs(latestMatch.publishedAt!);
    const endOfView = matchingDayUtils.getEndOfView(publishedDate.toDate()).toDate();

    if (this.checkOver(endOfView)) {
      return watingResponse;
    }

    return {
      id: latestMatch.id,
      endOfView,
      partner: await onOpen(),
      type: 'open',
    }
  }

  checkRematchingEligibility(match: RawMatch): Rematching {
    const endOfView = matchingDayUtils.getEndOfView(match.publishedAt);
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

}
