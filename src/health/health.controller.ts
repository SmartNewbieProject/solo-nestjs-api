import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor() { }

  @Get()
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Health Check Endpoint' })
  @ApiResponse({
    status: 200,
    description: '서비스가 정상적으로 동작 중입니다.',
  })
  check() {
    return;
  }
}