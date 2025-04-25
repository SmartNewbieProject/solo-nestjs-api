import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminUserDetailRepository } from '../repositories/admin-user-detail.repository';
import {
  AccountStatus,
  BasicResponse,
  ForceLogoutRequest,
  SendProfileUpdateRequestRequest,
  SendWarningMessageRequest,
  UpdateAccountStatusRequest,
  UpdateUserProfileRequest,
  UserDetailResponse
} from '../dto/user-detail.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailService } from '@/common/services/mail.service';
import { Gender } from '@/types/enum';

@Injectable()
export class AdminUserDetailService {
  private readonly logger = new Logger(AdminUserDetailService.name);

  constructor(
    private readonly adminUserDetailRepository: AdminUserDetailRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
  ) {}

  /**
   * 사용자 상세 정보를 조회합니다.
   */
  async getUserDetail(userId: string): Promise<UserDetailResponse> {
    try {
      const userDetail = await this.adminUserDetailRepository.getUserDetail(userId);

      if (!userDetail) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 타입 안전성을 위해 명시적으로 변환
      const response: UserDetailResponse = {
        id: userDetail.id,
        name: userDetail.name,
        email: userDetail.email,
        phoneNumber: userDetail.phoneNumber,
        age: userDetail.age,
        gender: userDetail.gender || Gender.MALE, // 기본값 설정 (MALE 또는 FEMALE로 설정)
        accountStatus: userDetail.accountStatus,
        profileImages: userDetail.profileImages,
        instagramId: userDetail.instagramId,
        universityDetails: userDetail.universityDetails,
        preferences: userDetail.preferences,
        createdAt: userDetail.createdAt,
        lastActiveAt: userDetail.lastActiveAt,
        // 추가 정보
        role: userDetail.role,
        title: userDetail.title,
        introduction: userDetail.introduction,
        appearanceRank: userDetail.appearanceRank,
        oauthProvider: userDetail.oauthProvider,
        deletedAt: userDetail.deletedAt,
      };

      return response;
    } catch (error) {
      this.logger.error(`사용자 상세 정보 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 계정 상태를 변경합니다.
   */
  async updateAccountStatus(request: UpdateAccountStatusRequest): Promise<BasicResponse> {
    try {
      const { userId, status, reason } = request;
      const success = await this.adminUserDetailRepository.updateAccountStatus(userId, status, reason);

      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.status.updated', {
        userId,
        status,
        reason,
        updatedAt: new Date(),
      });

      // 상태 변경에 따른 추가 처리
      if (status === AccountStatus.SUSPENDED) {
        // 정지 상태로 변경된 경우 강제 로그아웃 처리
        await this.adminUserDetailRepository.forceLogout(userId, reason);

        // 정지 안내 이메일 발송 (필요시 구현)
        // await this.sendSuspensionEmail(userId, reason);
      }

      return {
        success: true,
        message: `사용자 계정 상태가 ${status}로 변경되었습니다.`,
      };
    } catch (error) {
      this.logger.error(`사용자 계정 상태 변경 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자에게 경고 메시지를 발송합니다.
   */
  async sendWarningMessage(request: SendWarningMessageRequest): Promise<BasicResponse> {
    try {
      const { userId, title, content } = request;
      const success = await this.adminUserDetailRepository.sendWarningMessage(userId, title, content);

      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.warning.sent', {
        userId,
        title,
        content,
        sentAt: new Date(),
      });

      return {
        success: true,
        message: '경고 메시지가 성공적으로 발송되었습니다.',
      };
    } catch (error) {
      this.logger.error(`경고 메시지 발송 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자를 강제 로그아웃 처리합니다.
   */
  async forceLogout(request: ForceLogoutRequest): Promise<BasicResponse> {
    try {
      const { userId, reason } = request;
      const success = await this.adminUserDetailRepository.forceLogout(userId, reason);

      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.force.logout', {
        userId,
        reason,
        logoutAt: new Date(),
      });

      return {
        success: true,
        message: '사용자가 성공적으로 강제 로그아웃 처리되었습니다.',
      };
    } catch (error) {
      this.logger.error(`강제 로그아웃 처리 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자에게 프로필 수정 요청을 발송합니다.
   */
  async sendProfileUpdateRequest(request: SendProfileUpdateRequestRequest): Promise<BasicResponse> {
    try {
      const { userId, title, content } = request;
      const success = await this.adminUserDetailRepository.sendProfileUpdateRequest(userId, title, content);

      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.profile.update.request', {
        userId,
        title,
        content,
        requestedAt: new Date(),
      });

      return {
        success: true,
        message: '프로필 수정 요청이 성공적으로 발송되었습니다.',
      };
    } catch (error) {
      this.logger.error(`프로필 수정 요청 발송 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 사용자 프로필을 직접 수정합니다.
   */
  async updateUserProfile(request: UpdateUserProfileRequest): Promise<BasicResponse> {
    try {
      const { userId, name, instagramId, reason } = request;
      const updateData: { name?: string; instagramId?: string | null } = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (instagramId !== undefined) {
        updateData.instagramId = instagramId;
      }

      const success = await this.adminUserDetailRepository.updateUserProfile(userId, updateData, reason);

      if (!success) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 이벤트 발생 (필요시 활용)
      this.eventEmitter.emit('user.profile.updated.by.admin', {
        userId,
        updateData,
        reason,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: '사용자 프로필이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      this.logger.error(`사용자 프로필 수정 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }
}
