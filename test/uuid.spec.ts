import { uuidv7 } from 'uuidv7';

describe('UUID v7 생성 테스트', () => {
  it('100개의 UUID v7을 생성하고 모두 고유한지 확인', () => {
    // 100개의 UUID 생성
    const uuids: string[] = [];
    for (let i = 0; i < 100; i++) {
      const id = uuidv7();
      uuids.push(id);

      // 콘솔에 출력
      console.log(`UUID #${i + 1}: ${id}`);
    }

    // 모든 UUID가 고유한지 확인
    const uniqueUuids = new Set(uuids);
    expect(uniqueUuids.size).toBe(100);

    // UUID 형식 확인 (정규식 패턴)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    uuids.forEach((uuid) => {
      expect(uuid).toMatch(uuidPattern);
    });

    // 시간 순서대로 정렬되는지 확인 (UUID v7의 특징)
    const sortedUuids = [...uuids].sort();
    expect(sortedUuids).toEqual(uuids);
  });

  it('UUID v7이 시간에 따라 증가하는지 확인', () => {
    // 약간의 시간 간격을 두고 UUID 생성
    const uuid1 = uuidv7();

    // 10ms 대기
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    wait(10);

    const uuid2 = uuidv7();
    console.log('시간 간격 테스트:');
    console.log(`첫 번째 UUID: ${uuid1}`);
    console.log(`두 번째 UUID: ${uuid2}`);

    // 두 번째 UUID가 첫 번째보다 크다 (시간순 정렬 시)
    expect(uuid2 > uuid1).toBe(true);
  });
});
