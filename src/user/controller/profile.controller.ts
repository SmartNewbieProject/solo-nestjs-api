import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "../services/profile.service";
import { PreferenceSave } from "../dto/profile.dto";
import { CurrentUser } from "@/auth/decorators";
import { AuthenticationUser } from "@/types";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { profileResponseExample, unauthorizedResponseExample, notFoundResponseExample } from "../data/profile-response.schema";
import { preferenceSaveExample } from "../data/preference.schema";

@Controller('profile')
@ApiTags('프로필')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export default class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: '프로필 조회', description: '사용자 프로필을 조회합니다. 선호도 데이터를 포함합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '프로필 조회 성공',
    schema: {
      example: profileResponseExample
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: '인증 실패',
    schema: {
      example: unauthorizedResponseExample
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '프로필을 찾을 수 없음',
    schema: {
      example: notFoundResponseExample
    }
  })
  async getProfile(@CurrentUser() user: AuthenticationUser) {
    return await this.profileService.getUserProfiles(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: '프로필 선택 옵션 조회' })
  @ApiResponse({ status: 200, description: '선호도 옵션 조회 성공' })

  async getPreferences() {
    return await this.profileService.getAllPreferences();
  }

  @Patch('preferences')
  @ApiOperation({ summary: '프로필 선호도 저장', description: '사용자의 선호도 정보를 저장합니다.' })
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
      example: unauthorizedResponseExample
    }
  })
  async savePreferences(
    @CurrentUser() user: AuthenticationUser, 
    @Body() data: PreferenceSave
  )  {
    return await this.profileService.updatePreferences(user.id, data);
  }

}
