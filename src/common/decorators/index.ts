import { Inject } from '@nestjs/common';
export * from './inject-drizzle.decorator';

export const InjectSlack = () => Inject('SLACK');
