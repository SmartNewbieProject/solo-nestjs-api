import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

export type WeekDates = {
  start: Date;
  end: Date;
  tuesday: Date;
  thursday: Date;
}

const getWeekDates = (): WeekDates => {
  const date = dayjs();
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

const createPublishDate = (date: Date) => {
  const d = dayjs(date);
  d.set('hour', 21);
  d.set('minute', 0);
  d.set('second', 0);
  d.set('millisecond', 0);
  return d.toDate();
}

const weekDateService = {
  getWeekDates,
  isPublishDay,
  createPublishDate,
};

export default weekDateService;
