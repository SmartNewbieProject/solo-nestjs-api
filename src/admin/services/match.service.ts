import { Injectable } from "@nestjs/common";
import { MatchingService } from "@/matching/services/matching.service";
import AdminMatchRepository from "../repositories/match.repository";
import { AdminMatchRequest } from "@/matching/dto/matching";
import { ProfileService } from "@/user/services/profile.service";
import { PaginatedResponse, Pagination } from "@/types/common";
import { MatchType, UnmatchedUser } from "@/types/match";
import { Gender } from "@/types/enum";
import weekDateService from "@/matching/domain/date";
import dayjs from "dayjs";

interface MatchStats {
  totalMatchRate: number;
  maleMatchRate?: number;
  femaleMatchRate?: number;
}

@Injectable()
export default class AdminMatchService {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly profileService: ProfileService,
    private readonly adminMatchRepository: AdminMatchRepository
  ) { }

  async findMatches(matchingRequest: AdminMatchRequest) {
    const similarUsers = await this.matchingService.findMatches(matchingRequest.userId, matchingRequest.limit, MatchType.ADMIN);
    const ids = similarUsers.map(user => user.userId);
    const profiles = await this.profileService.getProfilesByIds(ids);
    return { profiles, similarUsers };
  }

  async getUnmatchedUsers(pagination: Pagination): Promise<PaginatedResponse<UnmatchedUser>> {
    return await this.adminMatchRepository.getUnmatchedUsers(pagination);
  }

  async getMatchStats(publishedAt: Date, gender?: Gender): Promise<MatchStats> {
    const date = new Date(publishedAt);
    weekDateService.createDayjs();
    date.setHours(21, 0, 0, 0);
    date.setHours(date.getHours() + 9);

    const totalCount = await this.adminMatchRepository.getTotalMatchCount(date);

    if (!totalCount) {
      return {
        totalMatchRate: 0,
        ...(gender === Gender.MALE ? { maleMatchRate: 0 } : {}),
        ...(gender === Gender.FEMALE ? { femaleMatchRate: 0 } : {}),
        ...((!gender) ? { maleMatchRate: 0, femaleMatchRate: 0 } : {})
      };
    }

    const stats: MatchStats = {
      totalMatchRate: 100
    };

    if (!gender || gender === Gender.MALE) {
      const maleCount = await this.adminMatchRepository.getGenderMatchCount(date, Gender.MALE);
      stats.maleMatchRate = (maleCount / totalCount) * 100;
    }

    if (!gender || gender === Gender.FEMALE) {
      const femaleCount = await this.adminMatchRepository.getGenderMatchCount(date, Gender.FEMALE);
      stats.femaleMatchRate = (femaleCount / totalCount) * 100;
    }

    return stats;
  }
}
