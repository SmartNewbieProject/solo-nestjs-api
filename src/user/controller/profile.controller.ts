import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { ProfileService } from "../services/profile.service";
import { InstagramId, PreferenceSave } from "../dto/profile.dto";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { ProfileDocs } from "../docs/profile.docs";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ProfileUpdatedEvent } from "@/events/profile-updated.event";
import { NameUpdated } from "../dto/user";

@Controller('profile')
@ProfileDocs.controller()
@Roles(Role.USER, Role.ADMIN)
export default class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @ProfileDocs.getProfile()
  async getProfile(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getUserProfiles(user.id);
  }

  @Get('preferences')
  @ProfileDocs.getPreferences()
  async getPreferences() {
    return await this.profileService.getAllPreferences();
  }
  
  @Post('nickname')
  @ProfileDocs.updateNickname()
  async updateNickname(@CurrentUser() user: AuthenticationUser, @Body() data: NameUpdated) {
    return {
      nickname: await this.profileService.changeNickname(user.id, data.nickname),
    };
  }

  @Patch('preferences')
  @ProfileDocs.updatePreferences()
  async updatePreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: PreferenceSave
  )  {
    const updatedProfile = await this.profileService.updatePreferences(user.id, data);
    
    this.eventEmitter.emit(
      'profile.updated',
      new ProfileUpdatedEvent(user.id, updatedProfile)
    );
    
    return updatedProfile;
  }

  @ProfileDocs.updateInstagramId()
  @Patch('/instagram')
  async updateInstagramId(@CurrentUser() user: AuthenticationUser, @Body() data: InstagramId) {
    const updatedProfile = await this.profileService.updateInstagramId(user.id, data.instagramId);
    
    return updatedProfile;
  }

}
