import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { PreferenceService } from '../services/preference.service';
import { ProfileService } from '../services/profile.service';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationUser } from '@/types';
import { PreferenceSave, SelfPreferenceSave } from '../dto/profile.dto';
import { ProfileDocs } from '../docs/profile.docs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from '@/events/profile-updated.event';

@ApiTags('이상형')
@Controller('preferences')
@Roles(Role.USER, Role.ADMIN)
export class PreferenceController {
  constructor(
    private readonly preferenceService: PreferenceService,
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOperation({ summary: '선호도 옵션 조회' })
  @Get('/options')
  async getOptions(@Query('name') typeName: string) {
    return await this.preferenceService.getPreferencesByName(typeName);
  }

  @ApiOperation({ summary: '선호도 입력 여부 확인' })
  @Get('/check/fill')
  async checkFill(@CurrentUser() user: AuthenticationUser) {
    return await this.preferenceService.checkFill(user.id);
  }

  @Get()
  @ProfileDocs.getPreferences()
  async getPreferences(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getAllPreferences(user.gender);
  }

  @Patch()
  @ProfileDocs.updatePreferences()
  async updatePreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: PreferenceSave,
  ) {
    return await this.profileService.updatePreferences(user.id, data);
  }

  @Get('self')
  @ApiOperation({
    summary: '본인 성향 조회',
    description: '현재 로그인한 사용자의 본인 성향 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '본인 성향 조회 성공',
    schema: {
      example: [
        {
          typeName: '성격 유형',
          selectedOptions: [
            { id: 'option-id-1', displayName: '외향적' },
            { id: 'option-id-2', displayName: '유머러스' },
          ],
        },
      ],
    },
  })
  async getSelfPreferences(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getSelfPreferences(user.id);
  }

  @Patch('self')
  @ApiOperation({
    summary: '본인 성향 수정',
    description: '현재 로그인한 사용자의 본인 성향 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '본인 성향 수정 성공',
    schema: {
      example: {
        id: 'user-id',
        preferences: [
          {
            typeName: '성격 유형',
            selectedOptions: [{ id: 'option-id-1', displayName: '외향적' }],
          },
        ],
      },
    },
  })
  async updateSelfPreferences(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: SelfPreferenceSave,
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
}
