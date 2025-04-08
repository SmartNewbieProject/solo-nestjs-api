import { BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export type WeekDates = {
  start: Date;
  end: Date;
  tuesday: Date;
  thursday: Date;
}

const createDayjs = () => dayjs();

const getWeekDates = (): WeekDates => {
  const date = createDayjs();
  const start = date.startOf('week').add(2, 'day');
  const end = date.endOf('week');

  const tuesday = start.add(1, 'day');
  const thursday = start.add(3, 'day');

  return {
    start: start.toDate(),
    end: end.toDate(),
    tuesday: tuesday.toDate(),
    thursday: thursday.toDate(),
  };
};

const isPublishDay = (date: Date) => {
  const { tuesday, thursday } = getWeekDates();
  const d = dayjs(date);
  
  const tuesdayBefore = d.isBefore(tuesday);
  if (tuesdayBefore) {
    return false;
  }

  const tuesdayNow = d.isSame(tuesday);
  if (tuesdayNow) {
    return true;
  }

  const thursdayBefore = d.isBefore(thursday);
  if (thursdayBefore) {
    return false;
  }

  const thursdayNow = d.isSame(thursday);
  if (thursdayNow) {
    return true;
  }

  return false;
};

const getCheckedDates = () => {
  const d = dayjs();
  const { tuesday, thursday, end } = getWeekDates();

  if (d.isBefore(tuesday)) {
    throw new BadRequestException('금주 매칭 이벤트 이전입니다.');
  }

  if ((d.isSame(d) || d.isAfter(d)) && d.isBefore(thursday)) {
    return { start: tuesday, end: thursday };
  }

  return { start: thursday, end };
};

const createPublishDate = (date: dayjs.Dayjs) => {
  console.log(date.format('YYYY-MM-DD HH:mm:ss'));
  const d = date
  .set('hour', 21)
  .set('minute', 0)
  .set('second', 0)
  .set('millisecond', 0);
  console.log(d.format('YYYY-MM-DD HH:mm:ss'));
  return d.toDate();
}

const weekDateService = {
  getWeekDates,
  isPublishDay,
  createPublishDate,
  createDayjs,
  getCheckedDates,
};

export default weekDateService;
