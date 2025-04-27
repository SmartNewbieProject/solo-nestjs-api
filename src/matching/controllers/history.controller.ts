import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { MatchHistoryService } from "../services/history.service";
import { UserProfile } from "@/types/user";

@Controller('matching/history')
@ApiBearerAuth('access-token')
@Roles(Role.USER, Role.ADMIN)
@ApiTags('매칭')
export class HistoryController {
  constructor(
    private readonly matchHistoryService: MatchHistoryService,
  ) { }

  @Get('/:id')
  @ApiOperation({
    summary: '매칭 히스토리 조회',
    description: '특정 매칭 ID에 대한 파트너 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '매칭된 파트너 정보'
  })
  async getPartnerById(@Param('id') id: string): Promise<UserProfile> {
    return await this.matchHistoryService.getHistory(id);
  }
}
