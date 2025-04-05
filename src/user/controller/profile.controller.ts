import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ProfileService } from "../services/profile.service";
import { InstagramId, PreferenceSave } from "../dto/profile.dto";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { ProfileDocs } from "../docs/profile.docs";

@Controller('profile')
@ProfileDocs.controller()
@Roles(Role.USER)
export default class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
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

  @Patch('preferences')
  @ProfileDocs.updatePreferences()
  async updatePreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: PreferenceSave
  )  {
    return await this.profileService.updatePreferences(user.id, data);
  }

  @ProfileDocs.updateInstagramId()
  @Patch('/instagram')
  async updateInstagramId(@CurrentUser() user: AuthenticationUser, @Body() data: InstagramId) {
    return await this.profileService.updateInstagramId(user.id, data.instagramId);
  }

}
