import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Patch } from "@nestjs/common";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { PasswordUpdated } from "../dto/user";

@ApiTags('유저')
@ApiBearerAuth('access-token')
@Controller('user')
@Roles(Role.USER, Role.ADMIN)
export default class UserController {

  @ApiOperation({ summary: '간단한 유저 정보 조회', description: '권한, id, 이름만 전달됩니다. 간단한 신원확인 목적으로만 활용하세요.' })
  @Get()
  async getSimpleUser(@CurrentUser() user: AuthenticationUser) {
    return {
      role: user.role,
      id: user.id,
      name: user.name,
    };
  }

  @Patch()
  async updatePassword(@CurrentUser() user: AuthenticationUser, @Body() passwordUpdated: PasswordUpdated) {
    
  }

}