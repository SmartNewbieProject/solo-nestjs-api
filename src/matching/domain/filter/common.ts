import { PreferenceTypeGroup } from "@/types/user";

export enum Key {
  DRINKING = '음주 선호도',
  SMOKING = '흡연 선호도',
  TATTOO = '문신 선호도',
  AGE = '선호 나이대',
}

export const getValue = (key: Key, group: PreferenceTypeGroup[]) => {
  const item = group.find(g => g.typeName === key)?.selectedOptions[0];
  if (!item) return null;
  return {
    id: item.id,
    displayName: item.displayName,
  };
};