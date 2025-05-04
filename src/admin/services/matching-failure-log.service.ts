import { Injectable } from '@nestjs/common';
import { MatchingFailureLogRepository } from '@/matching/repository/matching-failure-log.repository';

@Injectable()
export class MatchingFailureLogService {
  constructor(
    private readonly matchingFailureLogRepository: MatchingFailureLogRepository,
  ) {}

  async getFailureLogs(userId?: string) {
    return await this.matchingFailureLogRepository.getFailureLogs(userId);
  }
}
