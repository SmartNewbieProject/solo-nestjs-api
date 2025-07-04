import { UserRank } from '@/database/schema/profiles';
import { MatchType } from '@/types/match';

const LOSER = [UserRank.C, UserRank.B];

const RANK_MATCHING_RULES = {
  [MatchType.SCHEDULED]: {
    [UserRank.S]: [UserRank.S, UserRank.A],
    [UserRank.A]: [UserRank.A, UserRank.B],
    [UserRank.B]: [UserRank.A, UserRank.B],
    [UserRank.C]: LOSER,
    [UserRank.UNKNOWN]: false,
  },
  [MatchType.REMATCHING]: {
    [UserRank.S]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.A]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.B]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.C]: [UserRank.B, UserRank.C],
    [UserRank.UNKNOWN]: [UserRank.B, UserRank.C],
  },
  [MatchType.ADMIN]: {
    [UserRank.S]: [UserRank.S, UserRank.A],
    [UserRank.A]: [UserRank.A, UserRank.B],
    [UserRank.B]: [UserRank.A, UserRank.B],
    [UserRank.C]: LOSER,
    [UserRank.UNKNOWN]: false,
  },
} satisfies Record<MatchType, Record<UserRank, UserRank[] | false>>;

export const createRankFilter = (
  rank: UserRank,
  type: MatchType,
): string[] | false => {
  const rules = RANK_MATCHING_RULES[type];
  return rules[rank];
};
