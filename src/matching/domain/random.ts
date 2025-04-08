export const choiceRandom = <T>(arr: T[]): T => {
  const totalCount = arr.length;
  const randomIndex = Math.floor(Math.random() * totalCount);
  return arr[randomIndex];
};
