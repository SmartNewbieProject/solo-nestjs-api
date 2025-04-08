import dayjs from 'dayjs';
import 'dayjs/locale/ko';

// 한국어 로케일 설정
dayjs.locale('ko');

describe('날짜 공개 객체 테스트', () => {
  test('dayjs로 주의 시작일과 종료일 계산', () => {
    const date = dayjs('2024-04-09'); // 특정 날짜로 고정
    const weekStart = date.startOf('week');
    const weekEnd = date.endOf('week');

    console.log({
      date: date.format('YYYY-MM-DD'),
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
    });

    expect(weekStart.format('YYYY-MM-DD')).toBe('2024-04-07'); // 일요일
    expect(weekEnd.format('YYYY-MM-DD')).toBe('2024-04-13'); // 토요일
  });
});
