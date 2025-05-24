import { Controller, Patch, Param } from "@nestjs/common";
import { AdminProfileService } from "../services/profile.service";
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { Role } from "@/types/enum";
import { Roles } from "@/auth/decorators";

@Controller('admin/profiles')
@Roles(Role.ADMIN)
@ApiTags('어드민')
@ApiBearerAuth('access-token')
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @Patch('embeddings/:id')
  @ApiOperation({
    summary: '사용자 프로필 임베딩 업데이트',
    description: '업데이트한 사용자 프로필을 조회하여 벡터데이터베이스에 upsert 를 수행합니다. 관리자 백엔드에서 사용자 프로필 업데이트 후 호출하는 API입니다.'
  })
  @ApiResponse({
    status: 200,
    description: '벡터 업데이트 성공',
    schema: {
      properties: {
        success: { type: 'boolean', description: '업데이트 성공 여부' },
        message: { type: 'string', description: '결과 메시지' },
        userId: { type: 'string', description: '업데이트된 사용자 ID' }
      }
    }
  })
  async updateProfile(@Param('id') id: string) {
    return this.adminProfileService.updateProfile(id);
  }

}
