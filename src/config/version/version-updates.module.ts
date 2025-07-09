import { Module } from '@nestjs/common';
import VersionUpdatesController from './controller/version-updates.controller';
import VersionUpdatesService from './services/version-updates.service';
import VersionUpdatesRepository from './repository/version-updates.repository';

@Module({
  controllers: [VersionUpdatesController],
  providers: [VersionUpdatesService, VersionUpdatesRepository],
  exports: [VersionUpdatesService],
})
export class VersionUpdatesModule {}
