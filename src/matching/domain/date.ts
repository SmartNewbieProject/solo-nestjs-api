import { BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export type WeekDates = {
  start: Date;
  end: Date;
  thursday: Date;
  sunday: Date;
}

const createDayjs = (config?: dayjs.Dayjs) => dayjs(config);

const getWeekDates = (): WeekDates => {
  const date = createDayjs();
  const start = date.startOf('week').add(2, 'day').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
  const end = date.endOf('week');

  const thursday = start.add(3, 'day');
  const sunday = start.add(6, 'day');

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
}

const setDeadline = (d: Date) => {
  d.setHours(21);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

const getNextMatchingDate = () => {
  const { thursday, sunday } = getWeekDates();
  const now = createDayjs();
  // console.log({
  //   now: now.format('YYYY-MM-DD HH:mm:ss'),
  //   thursday: thursday.toISOString(),
  //   sunday: sunday.toISOString(),
  // });
  if (now.isBefore(thursday, 'second') || now.isSame(thursday, 'second')) {
    return dayjs(setDeadline(thursday));
  }
  return dayjs(setDeadline(sunday));
}

const weekDateService = {
  getWeekDates,
  isPublishDay,
  createPublishDate,
  createDayjs,
  getCheckedDates,
  getNextMatchingDate,
};

export default weekDateService;
