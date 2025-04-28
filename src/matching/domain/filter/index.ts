import { PreferenceTypeGroup } from "@/docs/matching.docs";
import { createRankFilter } from "./rank";
import compatibilities from "../compability";
import { UserProfile } from "@/types/user";

enum Key {
  DRINKING = '음주 선호도',
  SMOKING = '흡연 선호도',
  TATTOO = '문신 선호도',
}

const getValue = (key: Key, group: PreferenceTypeGroup[]) => {
  const item = group.find(g => g.typeName === key)?.selectedOptions[0];
  if (!item) return null;
  return {
    id: item.id,
    displayName: item.displayName,
  };
};

const createDrinkFilter = (group: PreferenceTypeGroup[]) => {
  const drinking = getValue(Key.DRINKING, group);
  if (!drinking) return compatibilities.DRINKING["상관없음"];
  return compatibilities.DRINKING[drinking.displayName];
};

const createSmokingFilter = (group: PreferenceTypeGroup[]) => {
  const smoking = getValue(Key.SMOKING, group);
  if (!smoking) return compatibilities.SMOKING["상관없음"];
  return compatibilities.SMOKING[smoking.displayName];
};

const createTattooFilter = (group: PreferenceTypeGroup[]) => {
  const tattoo = getValue(Key.TATTOO, group);
  if (!tattoo) return compatibilities.TATTOO["상관없음"];
  return compatibilities.TATTOO[tattoo.displayName];
};

const getFilters = (profile: UserProfile, isPremium: boolean) => {
  const rankFilter = createRankFilter(profile.rank, isPremium);
  const drinkFilter = createDrinkFilter(profile.preferences);
  const smokingFilter = createSmokingFilter(profile.preferences);
  const tattooFilter = createTattooFilter(profile.preferences);

  return { rankFilter, drinkFilter, smokingFilter, tattooFilter };
};

export const VectorFilter = {
  Rank: createRankFilter,
  Key,
  Drinking: createDrinkFilter,
  Smoking: createSmokingFilter,
  Tattoo: createTattooFilter,
  getFilters,
};
