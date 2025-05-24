import { ProfileUpdatedEvent } from "@/events/profile-updated.event";
import { ProfileService } from "@/user/services/profile.service";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AdminProfileService {
  constructor(
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateProfile(userId: string) {
    const profile = await this.profileService.getUserProfiles(userId);
    this.eventEmitter.emit(
      'profile.updated',
      new ProfileUpdatedEvent(userId, profile)
    );
  }

}
