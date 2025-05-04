import { Injectable, Logger } from '@nestjs/common';
import MatchingFailureLogRepository from '../repository/matching-failure-log.repository';

@Injectable()
export class MatchingFailureLogService {
  private readonly logger = new Logger(MatchingFailureLogService.name);

  constructor(
    private readonly matchingFailureLogRepository: MatchingFailureLogRepository,
  ) { }

  /**
   * 매칭 실패 로그를 저장합니다.
   * @param userId 사용자 ID
   * @param reason 실패 이유
   */
  async logMatchingFailure(userId: string, reason: string) {
    try {
      this.logger.debug(`매칭 실패 로그 저장: 사용자 ID ${userId}, 이유: ${reason}`);
      await this.matchingFailureLogRepository.createFailureLog(userId, reason);
      this.logger.debug(`매칭 실패 로그 저장 완료: 사용자 ID ${userId}`);
    } catch (error) {
      this.logger.error(`매칭 실패 로그 저장 중 오류 발생: ${error.message}`, error.stack);
      // 로그 저장 실패는 애플리케이션 흐름에 영향을 주지 않도록 예외를 던지지 않음
    }
  }
}
