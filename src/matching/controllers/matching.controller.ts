import { Controller, Get, Param, Post } from '@nestjs/common';
import MatchingCreationService from '../services/creation.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { MatchingService } from '../services/matching.service';
import { AuthenticationUser } from '@/types';
import { MatchDetails } from '@/types/match';
import {
  MatchingUserResponse,
  PartnerResponse,
  TotalMatchingCountResponse,
} from '@/docs/matching.docs';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('matching')
@ApiBearerAuth('access-token')
@ApiTags('매칭')
export default class UserMatchingController {
  constructor(
    private readonly matchingCreationService: MatchingCreationService,
    private readonly matchingService: MatchingService,
  ) {}

  @Get('users')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '매칭 대상 사용자 목록 조회',
    description: '매칭 처리가 필요한 사용자 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '매칭 대상 사용자 목록',
    type: MatchingUserResponse,
  })
  async getMatchingUserCount() {
    const list = await this.matchingCreationService.findAllMatchingUsers();
    return {
      count: list.length,
      list,
    };
  }

  @CacheKey('matching:total-count')
  @CacheTTL(86400)
  @Get('total-count')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: '전체 매칭 수 조회',
    description: '지금까지 생성된 전체 매칭의 수를 반환합니다. (24시간 캐시)',
  })
  @ApiResponse({
    status: 200,
    description: '전체 매칭 수 조회 성공',
    type: TotalMatchingCountResponse,
  })
  async getTotalMatchingCount(): Promise<TotalMatchingCountResponse> {
    return await this.matchingService.getTotalMatchingCount();
  }

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: '매칭 파트너 조회',
    description:
      '사용자의 최근 매칭 파트너를 조회합니다. 매칭된 파트너가 존재하지않으면 null 입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '매칭된 파트너 정보',
    type: PartnerResponse,
  })
  async getLatestPartner(
    @CurrentUser() user: AuthenticationUser,
  ): Promise<MatchDetails> {
    const partner = await this.matchingService.getLatestPartner(user.id);
    return partner;
  }

  @Post('/rematch')
  @ApiOperation({
    summary: '재매칭 요청',
    description: '재매칭권을 사용하여 새로운 매칭을 요청합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '재매칭 성공',
    type: PartnerResponse,
  })
  @ApiResponse({
    status: 403,
    description: '재매칭권이 없음',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: '재매칭권이 없습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '프로필 임베딩을 찾을 수 없습니다.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: '프로필 임베딩을 찾을 수 없습니다.',
        },
      },
    },
  })
  async rematch(
    @CurrentUser() user: AuthenticationUser,
  ): Promise<MatchDetails> {
    await this.matchingCreationService.rematch(user.id);
    // 재매칭 후 최신 파트너 정보 반환
    return await this.matchingService.getLatestPartner(user.id);
  }

  @Get('next-date')
  @ApiOperation({
    summary: '다음 매칭 날짜 조회',
    description: '다음 매칭 날짜를 조회합니다.',
  })
  getNextMatchingDate() {
    const nextMatchingDate = this.matchingService.getNextMatchingDate();
    return { nextMatchingDate };
  }

  @ApiOperation({
    summary: '미매칭 인원 주간 매칭 진행',
    description: '미매칭 인원에 대한 주간 매칭을 진행합니다.',
  })
  @Roles(Role.ADMIN)
  @Post('rest-members')
  async matchRestMembers() {
    return await this.matchingCreationService.matchRestMembers();
  }
}
