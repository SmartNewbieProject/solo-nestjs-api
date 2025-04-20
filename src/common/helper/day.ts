import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

export const dayUtils = {
  create: (config?: dayjs.Dayjs | Date | string | number | undefined) => {
    return config ? dayjs(config).tz('Asia/Seoul') : dayjs().tz('Asia/Seoul');
  },
  format: (date: dayjs.Dayjs | Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs(date).tz('Asia/Seoul').format(format);
  }
};
