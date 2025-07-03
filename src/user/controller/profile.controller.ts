import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { InstagramId, MbtiUpdate } from '../dto/profile.dto';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { ProfileDocs } from '../docs/profile.docs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProfileUpdatedEvent } from '@/events/profile-updated.event';
import { NameUpdated } from '../dto/user';
import { CommonProfile } from '@/types/user';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('notifications')
  @ApiOperation({
    summary: '공지사항 전달',
    description: '현재 로그인한 사용자에게 공지사항을 전달합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공지사항 전달 성공',
    schema: { example: { notifications: [] } },
  })
  async getNotifications(@CurrentUser() user: AuthenticationUser) {
    return await this.notificationService.getNotifications(user.id);
  }

  @Get()
  @ProfileDocs.getProfile()
  async getProfile(
    @CurrentUser() user: AuthenticationUser,
  ): Promise<CommonProfile> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rank: _, ...profiles } = await this.profileService.getUserProfiles(
      user.id,
    );
    return profiles;
  }

  @Patch('nickname')
  @ProfileDocs.updateNickname()
  async updateNickname(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: NameUpdated,
  ) {
    return {
      nickname: await this.profileService.changeNickname(
        user.id,
        data.nickname,
      ),
    };
  }

  @ProfileDocs.updateInstagramId()
  @Patch('/instagram')
  async updateInstagramId(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: InstagramId,
  ) {
    const updatedProfile = await this.profileService.updateInstagramId(
      user.id,
      data.instagramId,
    );

    return updatedProfile;
  }

  @Get('mbti')
  @ApiOperation({
    summary: '내 MBTI 조회',
    description: '현재 로그인한 사용자의 MBTI 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'MBTI 조회 성공',
    schema: { example: { mbti: 'INTJ' } },
  })
  async getMbti(@CurrentUser() user: AuthenticationUser) {
    const mbti = await this.profileService.getMbti(user.id);
    return { mbti };
  }

  @Patch('mbti')
  @ApiOperation({
    summary: '내 MBTI 수정',
    description: '현재 로그인한 사용자의 MBTI 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'MBTI 수정 성공',
    schema: { example: { mbti: 'ENFP' } },
  })
  async updateMbti(
    @CurrentUser() user: AuthenticationUser,
    @Body() data: MbtiUpdate,
  ) {
    await this.profileService.updateMbti(user.id, data.mbti);
    const updatedProfile = await this.profileService.getUserProfiles(
      user.id,
      false,
    );
    this.eventEmitter.emit(
      'profile.updated',
      new ProfileUpdatedEvent(user.id, updatedProfile),
    );
  }
}
