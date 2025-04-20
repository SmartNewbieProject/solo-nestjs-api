import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export const dayUtils = {
  create: (config?: dayjs.Dayjs) => dayjs(config),
};
