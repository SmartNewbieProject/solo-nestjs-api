import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import VersionUpdatesService from '../services/version-updates.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/domain/user-role.enum';
import { Public } from '@/auth/decorators/public.decorator';
import { Metadata } from '../types/metadata.type';

@ApiTags('version-updates')
@Controller('version-updates')
export default class VersionUpdatesController {
  constructor(private readonly versionUpdatesService: VersionUpdatesService) {}

  @Get('/latest')
  @Public()
  @ApiOperation({ summary: '최신 버전 정보 조회' })
  @ApiResponse({ status: 200, description: '최신 버전 정보 반환' })
  async getLatestVersion() {
    return await this.versionUpdatesService.getLatestVersion();
  }

  @Get('/')
  @Public()
  @ApiOperation({ summary: '모든 버전 정보 조회' })
  @ApiResponse({ status: 200, description: '모든 버전 정보 반환' })
  async getAllVersions() {
    return await this.versionUpdatesService.getAllVersions();
  }

  @Get('/:id')
  @Public()
  @ApiOperation({ summary: '특정 버전 정보 조회' })
  @ApiResponse({ status: 200, description: '특정 버전 정보 반환' })
  async getVersionById(@Param('id') id: string) {
    return await this.versionUpdatesService.getVersionById(id);
  }

  @Post('/')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '새 버전 생성 (Admin 전용)' })
  @ApiResponse({ status: 201, description: '새 버전 생성 성공' })
  async createVersion(
    @Body() body: { version: string; metadata?: Metadata; shouldUpdate?: boolean },
  ) {
    return await this.versionUpdatesService.createVersion(
      body.version,
      body.metadata,
      body.shouldUpdate ?? false,
    );
  }

  @Put('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '버전 정보 수정 (Admin 전용)' })
  @ApiResponse({ status: 200, description: '버전 정보 수정 성공' })
  async updateVersion(
    @Param('id') id: string,
    @Body()
    body: {
      version?: string;
      metadata?: Metadata;
      shouldUpdate?: boolean;
    },
  ) {
    return await this.versionUpdatesService.updateVersion(
      id,
      body.version,
      body.metadata,
      body.shouldUpdate,
    );
  }
}
