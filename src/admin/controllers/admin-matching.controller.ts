import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import {
  AdminMatchRequest,
  AdminMatchSingleRequest,
} from '@/matching/dto/matching';
import {
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
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
  ) {}

  @Post('/user/read')
  @ApiOperation({
    summary: '어드민 - 사용자 매칭 시뮬레이션',
    description:
      '특정 사용자의 매칭을 시뮬레이션합니다. 실제 매칭과 동일한 로직을 사용하지만 데이터베이스에 저장하지 않고, 슬랙 알림도 보내지 않습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '매칭 시뮬레이션 결과',
    schema: {
      properties: {
        success: { type: 'boolean', description: '시뮬레이션 성공 여부' },
        message: { type: 'string', description: '시뮬레이션 결과 메시지' },
        requester: {
          type: 'object',
          description: '매칭을 요청한 사용자 정보'
        },
        potentialPartners: {
          type: 'array',
          description: '매칭 가능한 파트너 목록',
          items: {
            type: 'object',
            properties: {
              profile: { type: 'object', description: '파트너 프로필 정보' },
              similarity: { type: 'number', description: '유사도 점수' }
            }
          }
        },
        selectedPartner: {
          type: 'object',
          description: '선택된 파트너 (실제 매칭 시 선택될 파트너)',
          properties: {
            profile: { type: 'object', description: '파트너 프로필 정보' },
            similarity: { type: 'number', description: '유사도 점수' }
          }
        }
      }
    }
  })
  async findMatches(@Body() matchingRequest: AdminMatchRequest) {
    return this.adminMatchService.simulateMatching(matchingRequest);
  }

  @Get('/unmatched-users')
  @ApiOperation({
    summary: '어드민 - 매칭되지 않은 사용자 조회',
    description: '매칭되지 않은 사용자를 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: true,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: '페이지 당 항목 수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '매칭되지 않은 사용자를 조회합니다.',
  })
  async getUnmatchedUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminMatchService.getUnmatchedUsers({ page, limit });
  }

  @Post('batch')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '어드민 매칭 처리 (배치)' })
  @ApiResponse({
    status: 200,
    description: '배치 매칭 처리가 시작되었습니다.',
    schema: {
      properties: {
        message: { type: 'string', description: '배치 매칭 처리 시작 메시지' }
      }
    }
  })
  async processMatchingBatch() {
    await this.matchingCreationService.processMatchCentral();
    return { message: '배치 매칭 처리가 시작되었습니다.' };
  }

  @ApiOperation({ summary: '어드민 매칭 처리 (단일)' })
  @ApiResponse({
    status: 200,
    description: '매칭 처리 결과',
    schema: {
      properties: {
        success: { type: 'boolean', description: '매칭 성공 여부' },
        requester: {
          type: 'object',
          description: '매칭을 요청한 사용자 정보',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            gender: { type: 'string' },
            age: { type: 'number' }
          }
        },
        partner: {
          type: 'object',
          description: '매칭된 파트너 정보',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            gender: { type: 'string' },
            age: { type: 'number' }
          }
        },
        similarity: {
          type: 'object',
          description: '매칭 유사도 점수',
          properties: {
            score: { type: 'number' },
            details: {
              type: 'object',
              properties: {
                ageScore: { type: 'number' },
                genderScore: { type: 'number' },
                interestsScore: { type: 'number' },
                personalitiesScore: { type: 'number' },
                lifestylesScore: { type: 'number' },
                mbtiScore: { type: 'number' },
                embeddingScore: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  @Post('user')
  @Roles(Role.ADMIN)
  async processMatchingSingle(@Body() request: AdminMatchSingleRequest) {
    const result = await this.matchingCreationService.createPartner(
      request.userId,
      MatchType.ADMIN,
    );

    return result;
  }

  @Get('match-stats')
  @ApiOperation({
    summary: '매칭 통계 조회',
    description: '성별에 따른 매칭 통계를 조회합니다.',
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: Gender,
    description: '성별에 따른 매칭 통계 조회 (미입력시 전체 통계)',
  })
  @ApiQuery({
    name: 'publishedAt',
    required: true,
    type: String,
    description: '매칭 발표 날짜 (예: 2024-04-16)',
  })
  async getMatchStats(
    @Query('gender') gender?: Gender,
    @Query('publishedAt') publishedAt?: string,
  ): Promise<{
    totalMatchRate: number;
    maleMatchRate?: number;
    femaleMatchRate?: number;
  }> {
    const date = publishedAt ? new Date(publishedAt) : new Date();
    return await this.adminMatchService.getMatchStats(date, gender);
  }
}
