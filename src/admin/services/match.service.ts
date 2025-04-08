import { Injectable } from "@nestjs/common";
import { MatchingService } from "@/matching/services/matching.service";
import AdminMatchRepository from "../repositories/match.repository";
import { AdminMatchRequest } from "@/matching/dto/matching";
import { ProfileService } from "@/user/services/profile.service";
import { PaginatedResponse, Pagination } from "@/types/common";
import { UnmatchedUser } from "@/types/match";

@Injectable()
export default class AdminMatchService {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly profileService: ProfileService,
    private readonly adminMatchRepository: AdminMatchRepository
  ) {}

  async findMatches(matchingRequest: AdminMatchRequest) {
    const similarUsers = await this.matchingService.findMatches(matchingRequest.userId, matchingRequest.limit);
    const ids = similarUsers.map(user => user.userId);
    const profiles = await this.profileService.getProfilesByIds(ids);
    return { profiles, similarUsers };
  }

  async getUnmatchedUsers(pagination: Pagination): Promise<PaginatedResponse<UnmatchedUser>> { 
    return await this.adminMatchRepository.getUnmatchedUsers(pagination);
  }
}
