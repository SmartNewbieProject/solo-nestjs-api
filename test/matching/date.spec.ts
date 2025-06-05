import weekDateService from '@/matching/domain/date';
import * as dayjs from 'dayjs';

// 테스트에서 사용할 고정된 날짜 (2024년 4월 9일 화요일)
const FIXED_DATE = '2024-04-09';

describe('날짜 공개 객체 테스트', () => {
  // 원본 console.log 함수를 저장
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // console.log 모킹
    console.log = jest.fn();
  });

  afterEach(() => {
    // 테스트 후 원래 함수로 복원
    console.log = originalConsoleLog;
  });

  test('dayjs로 주의 시작일과 종료일 계산', () => {
    const date = dayjs(FIXED_DATE); // 특정 날짜로 고정 (2024년 4월 9일 화요일)
    const weekStart = date.startOf('week');
    const weekEnd = date.endOf('week');

    expect(weekStart.format('YYYY-MM-DD')).toBe('2024-04-07'); // 일요일
    expect(weekEnd.format('YYYY-MM-DD')).toBe('2024-04-13'); // 토요일
  });

  test('createDayjs 함수는 한국 시간대를 적용한 dayjs 객체를 생성해야 함', () => {
    const date = weekDateService.createDayjs(new Date(FIXED_DATE));

    // 날짜가 올바르게 설정되었는지 확인
    expect(date.format('YYYY-MM-DD')).toBe(FIXED_DATE);
  });

  test('createPublishDate 함수는 날짜의 시간을 21:00:00으로 설정해야 함', () => {
    const date = weekDateService.createDayjs(new Date(FIXED_DATE));
    const publishDate = weekDateService.createPublishDate(date);

    expect(publishDate instanceof Date).toBe(true);

    const formattedDate = dayjs(publishDate).format('HH:mm:ss');
    expect(formattedDate).toBe('21:00:00');
  });
});

describe('재매칭권 만료 시간 계산 테스트', () => {
  const originalConsoleLog = console.log;

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  test('화요일 20시 이후 재매칭권 사용 - 목요일 20시에 만료', () => {
    const publishedAt = new Date('2025-06-03T21:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-05T20:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('금요일 20시 이후 재매칭권 사용 - 일요일 20시에 만료', () => {
    const publishedAt = new Date('2025-06-06T21:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-08T20:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('토요일 재매칭권 사용 - 일요일 20시에 만료', () => {
    const publishedAt = new Date('2025-06-07T15:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-08T20:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('수요일 재매칭권 사용 - 목요일 20시에 만료', () => {
    const publishedAt = new Date('2025-06-04T15:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-05T20:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('월요일 재매칭권 사용 - 기본 48시간 유지', () => {
    const publishedAt = new Date('2025-06-02T15:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-04T15:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('목요일 20시 이후 재매칭권 사용 - 기본 48시간 유지', () => {
    const publishedAt = new Date('2025-06-05T21:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-07T21:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('일요일 20시 이후 재매칭권 사용 - 기본 48시간 유지', () => {
    const publishedAt = new Date('2025-06-08T21:00:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);
    const expected = new Date('2025-06-10T21:00:00+09:00');

    expect(expiredAt.getTime()).toBe(expected.getTime());
  });

  test('calculateRematchExpiredAt 함수가 올바른 형식의 Date 객체를 반환', () => {
    const publishedAt = new Date('2025-06-05T15:30:00+09:00');
    const expiredAt = weekDateService.calculateRematchExpiredAt(publishedAt);

    expect(expiredAt instanceof Date).toBe(true);
    expect(isNaN(expiredAt.getTime())).toBe(false);
    expect(expiredAt.getTime()).toBeGreaterThan(publishedAt.getTime());
  });
});
