import { PreferenceTypeGroup } from "@/docs/matching.docs";
import { createRankFilter } from "./rank";
import compatibilities from "../compability";
import { UserProfile } from "@/types/user";
import { UserRank } from "@/database/schema/profiles";
import { MatchType } from "@/types/match";
import { Key, getValue } from "./common";
import { createAgeFilter } from "./age";
import { Gender } from "@/types/enum";

const createDrinkFilter = (group: PreferenceTypeGroup[]): null | string[] => {
  const drinking = getValue(Key.DRINKING, group);
  if (!drinking) return compatibilities.DRINKING["상관없음"];
  return compatibilities.DRINKING[drinking.displayName];
};

const createSmokingFilter = (group: PreferenceTypeGroup[]): null | string[] => {
  const smoking = getValue(Key.SMOKING, group);
  if (!smoking) return compatibilities.SMOKING["상관없음"];
  return compatibilities.SMOKING[smoking.displayName];
};

const createTattooFilter = (group: PreferenceTypeGroup[]): null | string[] => {
  const tattoo = getValue(Key.TATTOO, group);
  if (!tattoo) return compatibilities.TATTOO["상관없음"];
  return compatibilities.TATTOO[tattoo.displayName];
};

const getFilters = (profile: UserProfile, type: MatchType, targetGender: Gender) => {
  const rankFilter = createRankFilter(profile.rank as UserRank, type);
  const drinkFilter = createDrinkFilter(profile.preferences);
  const smokingFilter = createSmokingFilter(profile.preferences);
  const tattooFilter = createTattooFilter(profile.preferences);
  const ageFilter = createAgeFilter(profile.age, profile.preferences, profile.gender, targetGender);

  return { rankFilter, drinkFilter, smokingFilter, tattooFilter, ageFilter };
};

export const VectorFilter = {
  Rank: createRankFilter,
  Key,
  Drinking: createDrinkFilter,
  Smoking: createSmokingFilter,
  Tattoo: createTattooFilter,
  getFilters,
};
