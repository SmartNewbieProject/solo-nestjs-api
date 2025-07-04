import { choiceRandom } from '@/matching/domain/random';

test('랜덤 초이스 출력 테스트', () => {
  const users = Array.from({ length: 255 }).map((id) => ({ id }));

  const item = choiceRandom(users);

  console.log({ item });
});
