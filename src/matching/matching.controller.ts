import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MatchingService, MatchingResult } from './matching.service';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminMatchRequest } from './dto/matching';

import { ApiProperty, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from '@/user/services/profile.service';

export class MatchingWeightsDto {
  @ApiProperty({ description: '나이 가중치', required: false })
  age?: number;
  
  @ApiProperty({ description: '성별 가중치', required: false })
  gender?: number;
  
  @ApiProperty({ description: '관심사 가중치', required: false })
  interests?: number;
  
  @ApiProperty({ description: '성격 가중치', required: false })
  personalities?: number;
  
  @ApiProperty({ description: '라이프스타일 가중치', required: false })
  lifestyles?: number;
  
  @ApiProperty({ description: 'MBTI 가중치', required: false })
  mbti?: number;
  
  @ApiProperty({ description: '임베딩 가중치', required: false })
  embedding?: number;
}

export class MatchResultDto {
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
@ApiTags('매칭(어드민)')
@ApiBearerAuth('access-token')
export class AdminMatchingController {
  constructor(private readonly matchingService: MatchingService, private readonly profileService: ProfileService) {}

  @Post('/user/read')
  @ApiResponse({ status: 200, description: '특정 사용자의 매칭을 수행해서 결과만 조회합니다. (실제로 매칭이 수행되지않습니다.)' })
  async findMatches(
    @Body() matchingRequest: AdminMatchRequest,
  ) {
    const similarUsers = await this.matchingService.findMatches(matchingRequest.userId, matchingRequest.limit);
    const ids = similarUsers.map(user => user.userId);
    const profiles = await this.profileService.getProfilesByIds(ids);
    return { profiles, similarUsers };
  }

  @Post('weighted')
  @ApiResponse({ status: 200, description: '가중치를 적용한 매칭을 수행합니다.', type: [MatchResultDto] })
  async findWeightedMatches(
    @CurrentUser() user: AuthenticationUser,
    @Query('limit') limit?: string,
    @Body() weights?: MatchingWeightsDto,
  ): Promise<MatchingResult[]> {
    return await this.matchingService.findMatches(
      user.id,
      limit ? parseInt(limit) : 10,
      weights,
    );
  }
}
