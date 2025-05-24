import { ProfileUpdatedEvent } from "@/events/profile-updated.event";
import { ProfileService } from "@/user/services/profile.service";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AdminProfileService {
  private readonly logger = new Logger(AdminProfileService.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateProfile(userId: string) {
    try {
      this.logger.log(`사용자 ${userId}의 프로필 벡터 업데이트를 시작합니다.`);

      // sensitive를 false로 설정하여 rank 정보도 포함하여 조회
      const profile = await this.profileService.getUserProfiles(userId, false);

      this.logger.log(`조회된 프로필 정보 - 이름: ${profile.name}, 랭크: ${profile.rank}, MBTI: ${profile.mbti}`);

      this.eventEmitter.emit(
        'profile.updated',
        new ProfileUpdatedEvent(userId, profile)
      );

      this.logger.log(`사용자 ${userId}의 프로필 벡터 업데이트 이벤트를 발생시켰습니다.`);

      return {
        success: true,
        message: '프로필 벡터 업데이트가 성공적으로 시작되었습니다.',
        userId
      };
    } catch (error) {
      this.logger.error(`사용자 ${userId}의 프로필 벡터 업데이트 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

}
