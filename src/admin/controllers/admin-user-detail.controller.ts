import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminUserDetailService } from '../services/admin-user-detail.service';
import {
  BasicResponse,
  ForceLogoutRequest,
  SendProfileUpdateRequestRequest,
  SendWarningMessageRequest,
  UpdateAccountStatusRequest,
  UpdateUserProfileRequest,
  UserDetailResponse
} from '../dto/user-detail.dto';

@Controller('admin/users/detail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('어드민 - 유저 상세 관리')
@ApiBearerAuth('access-token')
export class AdminUserDetailController {
  constructor(private readonly adminUserDetailService: AdminUserDetailService) {}

  @Get(':userId')
  @ApiOperation({
    summary: '유저 상세 정보 조회',
    description: '특정 유저의 모든 상세 정보를 조회합니다.'
  })
  @ApiParam({
    name: 'userId',
    description: '조회할 사용자 ID',
    example: '01HFGXS6YW1234567890ABCDE'
  })
  @ApiResponse({
    status: 200,
    description: '유저 상세 정보 조회 성공',
    type: UserDetailResponse
  })
  async getUserDetail(@Param('userId') userId: string): Promise<UserDetailResponse> {
    return await this.adminUserDetailService.getUserDetail(userId);
  }

  @Post('/status')
  @ApiOperation({
    summary: '계정 상태 변경',
    description: '유저의 계정 상태를 변경합니다. (활성화/비활성화/정지)'
  })
  @ApiResponse({
    status: 200,
    description: '계정 상태 변경 성공',
    type: BasicResponse
  })
  async updateAccountStatus(@Body() request: UpdateAccountStatusRequest): Promise<BasicResponse> {
    return await this.adminUserDetailService.updateAccountStatus(request);
  }

  @Post('/warning')
  @ApiOperation({
    summary: '경고 메시지 발송',
    description: '유저에게 경고 메시지를 발송합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '경고 메시지 발송 성공',
    type: BasicResponse
  })
  async sendWarningMessage(@Body() request: SendWarningMessageRequest): Promise<BasicResponse> {
    return await this.adminUserDetailService.sendWarningMessage(request);
  }

  @Post('/logout')
  @ApiOperation({
    summary: '강제 로그아웃',
    description: '유저를 강제로 로그아웃 처리합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '강제 로그아웃 성공',
    type: BasicResponse
  })
  async forceLogout(@Body() request: ForceLogoutRequest): Promise<BasicResponse> {
    return await this.adminUserDetailService.forceLogout(request);
  }

  @Post('/profile-update-request')
  @ApiOperation({
    summary: '프로필 수정 요청 발송',
    description: '유저에게 프로필 수정 요청을 발송합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 요청 발송 성공',
    type: BasicResponse
  })
  async sendProfileUpdateRequest(@Body() request: SendProfileUpdateRequestRequest): Promise<BasicResponse> {
    return await this.adminUserDetailService.sendProfileUpdateRequest(request);
  }

  @Post('/profile')
  @ApiOperation({
    summary: '유저 프로필 직접 수정',
    description: '어드민이 유저의 프로필을 직접 수정합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '유저 프로필 수정 성공',
    type: BasicResponse
  })
  async updateUserProfile(@Body() request: UpdateUserProfileRequest): Promise<BasicResponse> {
    return await this.adminUserDetailService.updateUserProfile(request);
  }
}
