import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminUserAppearanceRepository } from '../repositories/admin-user-appearance.repository';
import { 
  AdminUserAppearanceListRequest, 
  AppearanceGrade, 
  BulkSetUserAppearanceGradeRequest, 
  SetUserAppearanceGradeRequest, 
  SetUserAppearanceGradeResponse, 
  UserAppearanceGradeStatsResponse, 
  UserProfileWithAppearance 
} from '../dto/user-appearance.dto';
import { PaginatedResponse } from '@/types/pagination';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdminUserAppearanceService {
  private readonly logger = new Logger(AdminUserAppearanceService.name);

  constructor(
    private readonly adminUserAppearanceRepository: AdminUserAppearanceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 사용자 목록을 필터링하여 조회합니다.
   */
  async getUsersWithAppearanceGrade(
    params: AdminUserAppearanceListRequest
  ): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    try {
      return await this.adminUserAppearanceRepository.getUsersWithAppearanceGrade(params);
    } catch (error) {
      this.logger.error(`사용자 목록 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자의 외모 등급을 설정합니다.
   */
  async setUserAppearanceGrade(
    request: SetUserAppearanceGradeRequest
  ): Promise<SetUserAppearanceGradeResponse> {
    try {
      const { userId, grade } = request;
      const success = await this.adminUserAppearanceRepository.setUserAppearanceGrade(userId, grade);
      
      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      
      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.appearance.updated', {
        userId,
        grade,
        updatedAt: new Date(),
      });
      
      return {
        success: true,
        message: '외모 등급이 성공적으로 설정되었습니다.',
      };
    } catch (error) {
      this.logger.error(`사용자 외모 등급 설정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 여러 사용자의 외모 등급을 일괄 설정합니다.
   */
  async bulkSetUserAppearanceGrade(
    request: BulkSetUserAppearanceGradeRequest
  ): Promise<SetUserAppearanceGradeResponse> {
    try {
      const { userIds, grade } = request;
      const updatedCount = await this.adminUserAppearanceRepository.bulkSetUserAppearanceGrade(userIds, grade);
      
      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.appearance.bulk.updated', {
        userIds,
        grade,
        updatedCount,
        updatedAt: new Date(),
      });
      
      return {
        success: true,
        message: `${updatedCount}명의 사용자 외모 등급이 성공적으로 설정되었습니다.`,
      };
    } catch (error) {
      this.logger.error(`사용자 외모 등급 일괄 설정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 외모 등급별 사용자 수 통계를 조회합니다.
   */
  async getAppearanceGradeStats(): Promise<UserAppearanceGradeStatsResponse> {
    try {
      return await this.adminUserAppearanceRepository.getAppearanceGradeStats();
    } catch (error) {
      this.logger.error(`외모 등급 통계 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 미분류 사용자 목록을 조회합니다.
   */
  async getUnclassifiedUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<UserProfileWithAppearance>> {
    try {
      return await this.adminUserAppearanceRepository.getUnclassifiedUsers(page, limit);
    } catch (error) {
      this.logger.error(`미분류 사용자 목록 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }
}
