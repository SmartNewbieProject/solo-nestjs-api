import { BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale('ko', {
  weekStart: 1,
});
dayjs.tz.setDefault('Asia/Seoul');

export type WeekDates = {
  start: Date;
  end: Date;
  thursday: Date;
  sunday: Date;
};

const createDayjs = (config?: dayjs.Dayjs | Date) => {
  return dayjs(config).tz('Asia/Seoul');
};

const getWeekDates = (): WeekDates => {
  const date = createDayjs();

  // 월요일부터 시작하는 주의 시작일
  const start = date
    .startOf('week')
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  // 주의 마지막일 (일요일)
  const end = date.endOf('week');

  // 목요일 (0시 0분 0초)
  const thursday = start
    .add(3, 'day')
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  // 일요일 (0시 0분 0초)

  const sunday = end
    .clone()
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  // console.log('getWeekDates 함수 내부 값:', {
  //   start: start.format('YYYY-MM-DD HH:mm:ss'),
  //   end: end.format('YYYY-MM-DD HH:mm:ss'),
  //   thursday: thursday.format('YYYY-MM-DD HH:mm:ss'),
  //   sunday: sunday.format('YYYY-MM-DD HH:mm:ss'),
  // });

  return {
    start: start.toDate(),
    end: end.toDate(),
    thursday: thursday.toDate(),
    sunday: sunday.toDate(),
  };
};

const isPublishDay = (date: Date) => {
  const { thursday, sunday } = getWeekDates();
  const d = dayjs(date);

  const thursdayBefore = d.isBefore(thursday);
  if (thursdayBefore) {
    return false;
  }

  const thursdayNow = d.isSame(thursday);
  if (thursdayNow) {
    return true;
  }

  const sundayBefore = d.isBefore(sunday);
  if (sundayBefore) {
    return false;
  }

  const sundayNow = d.isSame(sunday);
  if (sundayNow) {
    return true;
  }

  return false;
};

const getCheckedDates = () => {
  const d = dayjs();
  const { thursday, sunday, end } = getWeekDates();

  if (d.isBefore(thursday)) {
    throw new BadRequestException('금주 매칭 이벤트 이전입니다.');
  }

  if ((d.isSame(d) || d.isAfter(d)) && d.isBefore(sunday)) {
    return { start: thursday, end: sunday };
  }

  return { start: sunday, end };
};

const createPublishDate = (date: dayjs.Dayjs) => {
  const d = date
    .set('hour', 21)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);
  return d.toDate();
};

const setDeadline = (d: Date) => {
  const dayjsDate = createDayjs(d)
    .set('hour', 21)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  return dayjsDate.toDate();
};

const getNextMatchingDate = () => {
  const { thursday, sunday } = getWeekDates();
  const now = createDayjs();
  // TODO: 테스트용
  // return now.add(1, 'minute');
  // return now.add(10, 'second');

  // 현재 시간이 목요일 전이면 목요일 21시로 설정
  if (now.isBefore(createDayjs(thursday).set('hour', 21))) {
    const result = createDayjs(setDeadline(thursday));
    console.log(`다음 매칭일: 목요일 ${result.format('YYYY-MM-DD HH:mm:ss')}`);
    return result;
  }

  // 그 외에는 일요일 21시로 설정
  const result = createDayjs(setDeadline(sunday));
  console.log(`다음 매칭일: 일요일 ${result.format('YYYY-MM-DD HH:mm:ss')}`);
  return result;
};

const test30seconds = () => {
  const now = createDayjs();
  return now.add(30, 'second');
};

const test1Minutes = () => {
  const now = createDayjs();
  return now.add(1, 'minute');
};

const calculateRematchExpiredAt = (publishedAt: Date): Date => {
  const published = createDayjs(publishedAt);
  const dayOfWeek = published.day();
  const hour = published.hour();

  const isThursdayAdjustmentPeriod =
    (dayOfWeek === 2 && hour >= 20) ||
    dayOfWeek === 3 ||
    (dayOfWeek === 4 && hour < 20);

  const isSundayAdjustmentPeriod =
    (dayOfWeek === 5 && hour >= 20) ||
    dayOfWeek === 6 ||
    (dayOfWeek === 0 && hour < 20);

  if (isThursdayAdjustmentPeriod) {
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
    return published
      .startOf('day')
      .add(daysUntilThursday, 'day')
      .set('hour', 20)
      .set('minute', 0)
      .set('second', 0)
      .toDate();
  }

  if (isSundayAdjustmentPeriod) {
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    return published
      .startOf('day')
      .add(daysUntilSunday, 'day')
      .set('hour', 20)
      .set('minute', 0)
      .set('second', 0)
      .toDate();
  }

  return published.add(48, 'hours').toDate();
};

const weekDateService = {
  getWeekDates,
  isPublishDay,
  createPublishDate,
  createDayjs,
  getCheckedDates,
  getNextMatchingDate,
  calculateRematchExpiredAt,
  test30seconds,
  test1Minutes,
};

export default weekDateService;
