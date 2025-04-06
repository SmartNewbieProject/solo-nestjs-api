import { Body, Controller, Post } from '@nestjs/common';
import { MatchingService } from '../../matching/services/matching.service';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { AdminMatchRequest } from '../../matching/dto/matching';

import { ApiProperty, ApiResponse, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfileService } from '@/user/services/profile.service';

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
  constructor(private readonly matchingService: MatchingService, private readonly profileService: ProfileService) {}

  @Post('/user/read')
  @ApiOperation({ summary: '어드민 - 사용자 매칭 결과만 보기', description: '특정 사용자의 매칭을 수행해서 결과만 조회합니다. (실제로 매칭이 수행되지않습니다.)' })
  @ApiResponse({ status: 200, description: '특정 사용자의 매칭을 수행해서 결과만 조회합니다. (실제로 매칭이 수행되지않습니다.)' })
  async findMatches(
    @Body() matchingRequest: AdminMatchRequest,
  ) {
    const similarUsers = await this.matchingService.findMatches(matchingRequest.userId, matchingRequest.limit);
    const ids = similarUsers.map(user => user.userId);
    const profiles = await this.profileService.getProfilesByIds(ids);
    return { profiles, similarUsers };
  }

}
