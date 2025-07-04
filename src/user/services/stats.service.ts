import { Injectable } from '@nestjs/common';
import { StatsRepository } from '../repository/stats.repository';

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  getTotalUserCount(): Promise<number> {
    return this.statsRepository.getTotalUserCount();
  }
}
