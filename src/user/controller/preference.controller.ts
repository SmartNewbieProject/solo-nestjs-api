import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { PreferenceService } from '../services/preference.service';
import { ProfileService } from '../services/profile.service';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationUser } from '@/types';
import {
  SelfPreferencesSave,
  PartnerPreferencesSave,
} from '../dto/profile.dto';
import { ProfileDocs } from '@/user/docs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from '@/events/profile-updated.event';
import { PreferenceTarget } from '@database/schema';

@ApiTags('이상형')
@Controller('preferences')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
export class PreferenceController {
  constructor(
    private readonly preferenceService: PreferenceService,
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ProfileDocs.getPreferenceOptions()
  @Get('/options')
  async getOptions(@Query('name') typeName: string) {
    return await this.preferenceService.getPreferencesByName(typeName);
  }

  @ProfileDocs.checkPreferenceFill()
  @Get('/check/fill')
  async checkFill(@CurrentUser() user: AuthenticationUser) {
    return await this.preferenceService.checkFill(user.id);
  }

  @Get('/self/options')
  @ProfileDocs.getPreferenceSelf()
  async getSelfPreferenceOptions(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getPreferences(
      user.gender,
      PreferenceTarget.SELF,
    );
  }

  @Get('/partner/options')
  @ProfileDocs.getPreferencePartner()
  async getPartnerPreferenceOptions(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getPreferences(
      user.gender,
      PreferenceTarget.PARTNER,
    );
  }

  @Get('/self')
  @ProfileDocs.getSelfPreferences()
  async getSelfPreferences(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getSelfPreferences(user.id);
  }

  @Patch('self')
  @ProfileDocs.updateSelfPreferences()
  async updateSelfPreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: SelfPreferencesSave,
  ) {
    const updatedProfile = await this.profileService.updateSelfPreferences(
      user.id,
      data,
    );

    this.eventEmitter.emit(
      'profile.updated',
      new ProfileUpdatedEvent(user.id, updatedProfile),
    );

    return updatedProfile;
  }

  @Patch('/partner')
  @ProfileDocs.updatePartnerPreferences()
  async updatePartnerPreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: PartnerPreferencesSave,
  ) {
    return await this.profileService.updatePartnerPreferences(user.id, data);
  }
}
