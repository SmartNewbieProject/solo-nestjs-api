import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from './slack.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SlackService],
  exports: [SlackService]
})
export class SlackNotificationModule {}
