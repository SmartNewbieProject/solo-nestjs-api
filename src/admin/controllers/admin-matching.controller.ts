import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminMatchRequest, AdminMatchSingleRequest } from '@/matching/dto/matching';
import { ApiProperty, ApiResponse, ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import AdminMatchService from '../services/match.service';
import MatchingCreationService from '@/matching/services/creation.service';
import { Gender } from '@/types/enum';
import { MatchType } from '@/types/match';

export class MatchResult {
  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '매칭 점수' })
  score: number;

  @ApiProperty({ description: '상세 점수 정보' })
  details: {
    ageScore: number;
    genderScore: number;
    interestsScore: number;
    personalitiesScore: number;
    lifestylesScore: number;
    mbtiScore: number;
    embeddingScore: number;
  };
}

@Controller('admin/matching')
@Roles(Role.ADMIN)
@ApiTags('어드민')
@ApiBearerAuth('access-token')
export class AdminMatchingController {
  constructor(
    private readonly adminMatchService: AdminMatchService,
    private readonly matchingCreationService: MatchingCreationService,
  ) { }

  @Post('/user/read')
  @ApiOperation({ summary: '어드민 - 사용자 매칭 결과만 보기', description: '특정 사용자의 매칭을 수행해서 결과만 조회합니다. (실제로 매칭이 수행되지않습니다.)' })
  @ApiResponse({ status: 200, description: '특정 사용자의 매칭을 수행해서 결과만 조회합니다. (실제로 매칭이 수행되지않습니다.)' })
  async findMatches(@Body() matchingRequest: AdminMatchRequest) {
    return this.adminMatchService.findMatches(matchingRequest);
  }

  @Get('/unmatched-users')
  @ApiOperation({ summary: '어드민 - 매칭되지 않은 사용자 조회', description: '매칭되지 않은 사용자를 조회합니다.' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지 당 항목 수', example: 10 })
  @ApiResponse({ status: 200, description: '매칭되지 않은 사용자를 조회합니다.' })
  async getUnmatchedUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminMatchService.getUnmatchedUsers({ page, limit });
  }

  @Post('batch')
  @Roles(Role.ADMIN)
  async processMatchingBatch() {
    await this.matchingCreationService.processMatchCentral();
  }

  @ApiOperation({ summary: '어드민 매칭 처리 (단일)' })
  @Post('user')
  @Roles(Role.ADMIN)
  async processMatchingSingle(@Body() request: AdminMatchSingleRequest) {
    await this.matchingCreationService.createPartner(request.userId, MatchType.ADMIN);
  }

  @Get('match-stats')
  @ApiOperation({ summary: '매칭 통계 조회', description: '성별에 따른 매칭 통계를 조회합니다.' })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: Gender,
    description: '성별에 따른 매칭 통계 조회 (미입력시 전체 통계)'
  })
  @ApiQuery({
    name: 'publishedAt',
    required: true,
    type: String,
    description: '매칭 발표 날짜 (예: 2024-04-16)'
  })
  async getMatchStats(
    @Query('gender') gender?: Gender,
    @Query('publishedAt') publishedAt?: string
  ): Promise<{ totalMatchRate: number; maleMatchRate?: number; femaleMatchRate?: number }> {
    const date = publishedAt ? new Date(publishedAt) : new Date();
    return await this.adminMatchService.getMatchStats(date, gender);
  }
}
