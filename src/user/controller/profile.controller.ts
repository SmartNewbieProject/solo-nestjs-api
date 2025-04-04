import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "../services/profile.service";

@Controller('profile')
@ApiTags('프로필')
@ApiBearerAuth('access-token')
export default class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  async getProfile() {
    return { message: '프로필 조회' };
  }

  @Get('preferences')
  @ApiOperation({ summary: '프로필 선택 옵션 조회' })
  @ApiResponse({ status: 200, description: '선호도 옵션 조회 성공' })
  async getPreferences() {
    return await this.profileService.getAllPreferences();
  }

}
