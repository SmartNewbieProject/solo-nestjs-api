import { UserRank } from "@/database/schema/profiles";

export const createRankFilter = (rank: UserRank, isRematching = false): string[] | false => {
  switch (rank) {
    case UserRank.S:
      return [UserRank.S, UserRank.A];
    case UserRank.A:
      return [UserRank.A, UserRank.B];
    case UserRank.B:
      return [UserRank.A, UserRank.B];
    case UserRank.C:
      return false;
    default:
      return false;
  }
};
