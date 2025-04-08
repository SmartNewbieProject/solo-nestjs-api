import { Controller, Get, Post, Body } from "@nestjs/common";
import MatchingCreationService from "../services/creation.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { AdminMatchSingleRequest } from "../dto/matching";
import { MatchingService } from "../services/matching.service";
import { AuthenticationUser } from "@/types";

@Controller('matching')
@ApiBearerAuth('access-token')
@ApiTags('매칭')
export default class UserMatchingController {
  constructor(
    private readonly matchingCreationService: MatchingCreationService,
    private readonly matchingService: MatchingService,
  ) {}

  @Get('users')
  @Roles(Role.ADMIN)
  async getMatchingUserCount() {
    const list = await this.matchingCreationService.findAllMatchingUsers();
    return {
      count: list.length,
      list,
    };
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: '매칭 파트너 조회' })
  async getLatestPartner(@CurrentUser() user: AuthenticationUser) {
    const partner = await this.matchingService.getLatestPartner(user.id);
    return {
      partner,
    };
  }

}
