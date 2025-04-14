import { AxiosError, isAxiosError } from 'axios';
import { InternalServerErrorException } from '@nestjs/common';

export const axiosHandler = async (
  callback: (...args: unknown[]) => unknown,
  onError?: (error: AxiosError) => unknown,
) => {
  try {
    return await callback();
  } catch (error) {
    if (isAxiosError(error) && !!onError) {
      return onError?.(error);
    }
    throw new InternalServerErrorException(error);
  }
};
