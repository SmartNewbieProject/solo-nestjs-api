import { Controller, Patch, Param } from "@nestjs/common";
import { AdminProfileService } from "../services/profile.service";
import { ApiOperation } from "@nestjs/swagger";
import { Role } from "@/types/enum";
import { Roles } from "@/auth/decorators";

@Controller('admin/profiles')
@Roles(Role.ADMIN)
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @Patch('embeddings/:id')
  @ApiOperation({ summary: '사용자 프로필 임베딩 업데이트', description: '업데이트한 사용자 프로필을 조회하여 벡터데이터베이스에 upsert 를 수행합니다.' })
  async updateProfile(@Param('id') id: string) {
    return this.adminProfileService.updateProfile(id);
  }

}
