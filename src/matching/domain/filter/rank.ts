import { UserRank } from "@/database/schema/profiles";

const RANK_MATCHING_RULES = {
  default: {
    [UserRank.S]: [UserRank.S, UserRank.A],
    [UserRank.A]: [UserRank.A, UserRank.B],
    [UserRank.B]: [UserRank.A, UserRank.B],
    [UserRank.C]: false,
    [UserRank.UNKNOWN]: false,
  },
  rematching: {
    [UserRank.S]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.A]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.B]: [UserRank.S, UserRank.A, UserRank.B],
    [UserRank.C]: [UserRank.B, UserRank.C],
    [UserRank.UNKNOWN]: [UserRank.B, UserRank.C],
  },
} satisfies Record<string, Record<UserRank, UserRank[] | false>>;

export const createRankFilter = (rank: UserRank, isRematching = false): string[] | false => {
  const rules = isRematching ? RANK_MATCHING_RULES.rematching : RANK_MATCHING_RULES.default;
  return rules[rank];
};
