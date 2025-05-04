import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { MatchingFailureLogService } from '../services/matching-failure-log.service';
import { GetMatchingFailureLogsQuery, MatchingFailureLogResponse } from '../dto/matching-failure-log.dto';

@Controller('admin/matching-failure-logs')
@Roles(Role.ADMIN)
@ApiTags('어드민')
@ApiBearerAuth('access-token')
export class AdminMatchingFailureLogController {
  constructor(
    private readonly matchingFailureLogService: MatchingFailureLogService,
  ) {}

  @Get()
  @ApiOperation({ summary: '어드민 - 매칭 실패 로그 조회', description: '매칭 실패 로그를 조회합니다.' })
  @ApiResponse({ 
    status: 200, 
    description: '매칭 실패 로그 목록', 
    type: [MatchingFailureLogResponse] 
  })
  async getFailureLogs(@Query() query: GetMatchingFailureLogsQuery) {
    return await this.matchingFailureLogService.getFailureLogs(query.userId);
  }
}
