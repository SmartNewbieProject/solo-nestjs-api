import { Controller, Get, Post, Body } from "@nestjs/common";
import MatchingCreationService from "../services/creation.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { AdminMatchSingleRequest } from "../dto/matching";

@Controller('matching')
@ApiBearerAuth('access-token')
@ApiTags('매칭')
export default class UserMatchingController {
  constructor(
    private readonly matchingCreationService: MatchingCreationService,
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

}
