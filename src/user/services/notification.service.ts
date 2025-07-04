import { NotificationRepository } from '../repository/notification.repository';
import { Injectable } from '@nestjs/common';
import ProfileRepository from '../repository/profile.repository';
import { Notification } from '@/types/notification';
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications: (Notification | null)[] = [
      await this.getIdealTypeNotification(userId),
      await this.getMbtiNotification(userId),
    ];
    return notifications.filter(Boolean) as Notification[];
  }

  private async getIdealTypeNotification(
    userId: string,
  ): Promise<Notification | null> {
    const isMemberHasIdealTypes =
      await this.notificationRepository.isMemberHasIdealTypes(userId);
    if (isMemberHasIdealTypes) return null;
    return {
      announcement: '매칭을 위해 이상형을 등록해주세요',
      title: '이상형 등록',
      content: '이상형을 등록하지않으면 매칭이 수행되지 않아요',
      okMessage: '네 등록할게요',
      redirectUrl: '/my',
    };
  }

  private async getMbtiNotification(
    userId: string,
  ): Promise<Notification | null> {
    const mbti = await this.profileRepository.getMbti(userId);
    if (mbti) return null;
    return {
      announcement: 'MBTI 를 등록해주세요',
      title: '회원님의 MBTI가 필요해요',
      content: '마이페이지에서 MBTI를 등록해주세요.',
      okMessage: '네 등록할게요.',
      redirectUrl: '/my',
    };
  }
}
