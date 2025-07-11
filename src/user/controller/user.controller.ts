import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Patch, Delete, Param } from "@nestjs/common";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { PasswordUpdated, WithdrawRequest } from "../dto/user";
import UserService from "../services/user.service";
import { UserDocs } from "../docs/user.docs";

@ApiTags('유저')
@ApiBearerAuth('access-token')
@Controller('user')
@Roles(Role.USER, Role.ADMIN)
export default class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @ApiOperation({ summary: '간단한 유저 정보 조회', description: '권한, id, profileId, 이름만 전달됩니다. 간단한 신원확인 목적으로만 활용하세요.' })
  @Get()
  async getSimpleUser(@CurrentUser() user: AuthenticationUser) {
    const profileInfo = await this.userService.getProfileIdByUserId(user.id);

    return {
      role: user.role,
      id: user.id,
      profileId: profileInfo?.id || null,
      name: user.name,
    };
  }

  @Get('/details')
  @UserDocs.getUserDetails()
  async getMyDetails(@CurrentUser() user: AuthenticationUser) {
    return await this.userService.getUserDetails(user.id);
  }

  @Patch()
  @UserDocs.updatePassword()
  async updatePassword(@CurrentUser() user: AuthenticationUser, @Body() passwordUpdated: PasswordUpdated) {
    await this.userService.updatePassword(user.id, passwordUpdated);
  }

  @Delete('withdrawl')
  async deleteProfile(@CurrentUser() user: AuthenticationUser, @Body() withdrawRequest: WithdrawRequest) {
    await this.userService.withdraw(user.id, withdrawRequest);
  }
}

@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('/admin/users')
export class AdminQdrantSyncController {
  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  async deleteQdrantUser(@Param('id') userId: string) {
    await this.userService.deleteQdrantUser(userId);
    return { message: 'Qdrant 포인트가 삭제되었습니다.' };
  }
}