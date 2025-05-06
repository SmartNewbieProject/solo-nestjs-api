
import { Controller, Get, Query } from "@nestjs/common";
import { PreferenceService } from "../services/preference.service";
import { CurrentUser, Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthenticationUser } from "@/types";

@ApiTags("이상형")
@Controller('preferences')
@Roles(Role.USER, Role.ADMIN)
export class PreferenceController {
  constructor(
    private readonly preferenceService: PreferenceService,
  ) { }

  @ApiOperation({ summary: '선호도 옵션 조회' })
  @Get('/options')
  async getOptions(@Query("name") typeName: string) {
    return await this.preferenceService.getPreferencesByName(typeName);
  }

  @ApiOperation({ summary: '선호도 입력 여부 확인' })
  @Get('/check/fill')
  async checkFill(@CurrentUser() user: AuthenticationUser) {
    return await this.preferenceService.checkFill(user.id);
  }

}
