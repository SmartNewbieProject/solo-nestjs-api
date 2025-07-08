import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { RedisService } from '@/config/redis/redis.service';
import { VersionResponse } from './dto/version-response.dto';
import { Role } from '@/types/enum';
import { Roles } from '@auth/decorators';

@ApiTags('Version')
@Controller('/version')
export class VersionManageController {
  constructor(private readonly redisService: RedisService) {}

  @Get('/store')
  @ApiOperation({ summary: '스토어 버전 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '스토어 버전 정보 조회 성공',
    type: VersionResponse,
  })
  async getStoreVersion(): Promise<VersionResponse> {
    const version =
      await this.redisService.getObject<VersionResponse>('version:store');
    return version ?? { version: '1.0.0', forceRedirect: false };
  }

  @Roles(Role.ADMIN)
  @Put('/store')
  @ApiOperation({ summary: '스토어 버전 정보 갱신' })
  @ApiBody({
    type: VersionResponse,
    description: '갱신할 버전 정보',
  })
  @ApiResponse({
    status: 200,
    description: '스토어 버전 정보 갱신 성공',
    type: VersionResponse,
  })
  async updateStoreVersion(
    @Body() versionData: VersionResponse,
  ): Promise<VersionResponse> {
    await this.redisService.setObject('version:store', versionData);
    return versionData;
  }
}
