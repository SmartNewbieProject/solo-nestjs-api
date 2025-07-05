import { Controller, Get } from '@nestjs/common';
import { StatsService } from '../services/stats.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/auth/decorators';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @ApiOperation({ summary: '총 유저 수 조회' })
  @ApiResponse({ status: 200, description: '총 유저 수', type: Number })
  @Get('total-user-count')
  async getTotalUserCount(): Promise<number> {
    return this.statsService.getTotalUserCount();
  }
}
