import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "../services/profile.service";
import { PreferenceSave } from "../dto/profile.dto";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";

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

  @Patch('preferences')
  @ApiOperation({ summary: '프로필 선호도 저장' })
  @ApiResponse({ 
    status: 200, 
    description: '프로필 선호도 저장 성공',
    schema: {
      example: {
        success: true
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 형식',
    schema: {
      example: {
        statusCode: 400,
        message: [
          "data must be an array"
        ],
        error: "Bad Request"
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized"
      }
    }
  })
  async savePreferences(@CurrentUser() user: AuthenticationUser, @Body() data: PreferenceSave)  {
    return await this.profileService.updatePreferences(user.id, data);
  }

}
