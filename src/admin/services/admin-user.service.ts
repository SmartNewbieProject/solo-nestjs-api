import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { PaginationParams, PaginatedResponse } from '@/types/pagination';
import { UserProfile } from '@/types/user';
import { ProfileService } from '@/user/services/profile.service';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly profileService: ProfileService,
  ) {}

  async getUsersList(params: PaginationParams): Promise<PaginatedResponse<UserProfile>> {
    const { page, limit } = params;
    
    const totalItems = await this.adminRepository.getUsersCount();
    const totalPages = Math.ceil(totalItems / limit);
    const usersData = await this.adminRepository.getUsers(params);
    
    const items = await Promise.all(
      usersData.map(async (user) => {
        try {
          const profile = await this.profileService.getUserProfiles(user.id);
          return profile;
        } catch (error) {
          if (error instanceof NotFoundException) {
            return {
              name: user.name || '이름 없음',
              age: 0,
              gender: user.profile?.gender || '미지정',
              profileImages: [],
              instagramId: null,
              universityDetails: null,
              preferences: [],
            } as UserProfile;
          }
          throw error;
        }
      })
    );

    return {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
