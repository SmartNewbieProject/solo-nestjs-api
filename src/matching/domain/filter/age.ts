import { PreferenceTypeGroup } from '@/types/user';
import { ArrayFilter } from './types';
import { getValue, Key } from './common';
import { Gender } from '@/types/enum';

export const createAgeFilter = (
  age: number,
  options: PreferenceTypeGroup[],
  gender: Gender,
  targetGender: Gender,
): ArrayFilter | null => {
  const agePref = getValue(Key.AGE, options);
  if (!agePref) return null;
  const { displayName } = agePref;

  let minAge = 18;
  let maxAge = 99;

  switch (displayName) {
    case '동갑':
      minAge = age - 1;
      maxAge = age + 1;
      break;
    case '연하':
      minAge = age - 5;
      maxAge = age - 1;
      break;
    case '연상':
      minAge = age + 1;
      maxAge = age + 5;
      break;
    case '상관없음':
      if (gender === Gender.FEMALE && targetGender === Gender.MALE) {
        minAge = age - 5;
        maxAge = age - 1;
      } else if (gender === Gender.MALE && targetGender === Gender.FEMALE) {
        minAge = age + 1;
        maxAge = age + 5;
      } else {
        minAge = age - 5;
        maxAge = age + 5;
      }
      break;
    default:
      minAge = age - 5;
      maxAge = age + 5;
  }

  const allowedAges = Array.from({ length: maxAge - minAge + 1 }, (_, i) =>
    String(minAge + i),
  );

  return {
    key: `profileSummary.age`,
    match: { any: allowedAges },
  };
};
