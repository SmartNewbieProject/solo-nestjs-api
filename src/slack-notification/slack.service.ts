import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { Gender } from '@/types/enum';
import { PreferenceTypeGroup, UserProfile } from '@/types/user';
import { SignupRequest } from '@/auth/dto';
import weekDateService from '@/matching/domain/date';

// Slack Block Kit 타입 정의
type SlackBlock = {
  type: 'header' | 'section' | 'divider';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
};

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private slack: WebClient;
  private token: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.token = configService.get('SLACK_TOKEN');
    if (!this.token) {
      throw new Error('SLACK_TOKEN is not set');
    }
    this.slack = new WebClient(this.token);
  }

  async sendNotification(message: string, channel: string = '매칭-테스트-로그') {
    try {
      this.logger.debug(`슬랙 메시지 전송 시도 - 채널: ${channel}`);

      // 채널 이름에서 # 기호 제거 (슬랙 API는 # 없이 채널 이름만 필요)
      const cleanChannel = channel.startsWith('#') ? channel.substring(1) : channel;

      const result = await this.slack.chat.postMessage({
        channel: cleanChannel,
        text: message,
        username: '썸타임 봇',
        icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
      });

      this.logger.debug(`슬랙 메시지 전송 성공 - 채널: ${cleanChannel}, ts: ${result.ts}`);
      return result;
    } catch (error) {
      this.logger.error(`슬랙 메시지 전송 실패 - 채널: ${channel}, 오류: ${error.message}`);
      throw error;
    }
  }

  async sendErrorNotification(
    error: Error,
    errorContext: {
      path: string;
      method: string;
      timestamp: string;
      error: string;
      exception?: unknown;
      user?: { id: string; email: string; };
    }
  ) {
    const environment = this.configService.get('NODE_ENV', 'development');

    // 메인 메시지용 간단한 블록
    const blocks: SlackBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 예상치 못한 서버 오류 발생`,
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*HTTP Method:*\n" + `\`${errorContext.method}\``
          },
          {
            type: "mrkdwn",
            text: "*Endpoint:*\n" + `\`${errorContext.path}\``
          }
        ]
      }
    ];

    if (environment === 'development') {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "ℹ️ *해당 오류는 개발 테스트간 발생한 오류이므로 안전합니다.*"
        }
      });
    }

    // 메인 메시지 전송
    const result = await this.slack.chat.postMessage({
      channel: '#emergency',
      blocks,
      text: `🚨 Error: ${error.message}`,
      username: '썸타임 긴급 오류 알리미',
      icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
    });

    // 상세 정보를 스레드로 전송
    if (result.ts) {
      const detailBlocks: SlackBlock[] = [
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*시간:*\n" + `\`${errorContext.timestamp}\``
            },
            {
              type: "mrkdwn",
              text: "*환경:*\n" + `\`${environment}\``
            }
          ]
        }
      ];

      if (errorContext.user) {
        detailBlocks.push({
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*사용자 ID:*\n" + `\`${errorContext.user.id}\``
            },
            {
              type: "mrkdwn",
              text: "*사용자 이메일:*\n" + `\`${errorContext.user.email}\``
            }
          ]
        });
      }

      const errorJson = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        exception: errorContext.exception
      };

      detailBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*에러 상세:*\n```" + JSON.stringify(errorJson, null, 2) + "```"
        }
      });

      await this.slack.chat.postMessage({
        channel: '#emergency',
        thread_ts: result.ts,
        blocks: detailBlocks,
        text: "에러 상세 정보",
        username: '썸타임 긴급 오류 알리미',
        icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
      });
    }
  }

  async sendMatchingNotification(userId: string, partnerId: string, similarity: number) {
    const message = `✨ New Match Created!\nUser: ${userId}\nPartner: ${partnerId}\nSimilarity: ${similarity.toFixed(2)}`;
    await this.sendNotification(message, 'matching');
  }

  async sendPaymentNotification(
    userId: string,
    userName: string,
    orderName: string,
    amount: number,
    method: string = '알 수 없음',
    paidAt?: Date
  ) {
    const paymentDate = paidAt || new Date();
    const formattedDate = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}-${String(paymentDate.getDate()).padStart(2, '0')} ${String(paymentDate.getHours()).padStart(2, '0')}:${String(paymentDate.getMinutes()).padStart(2, '0')}`;

    const message = `💰 결제 완료: ${userName} 사용자가 ${formattedDate}에 ${orderName}을 ${amount.toLocaleString()}원 결제했습니다. (결제 수단: ${method})`;

    return await this.sendNotification(message, '썸타임-결제알림');
  }

  async sendSingleMatch(
    requester: UserProfile,
    matcher: UserProfile,
    similarity: number,
    type: string = 'admin'
  ) {

    const getSimpleStringPreferences = (groups: PreferenceTypeGroup[]) => {
      const data = groups.map(({ typeName, selectedOptions }) => ({
        typeName,
        options: selectedOptions.map(option => `\`${option.displayName}\``).join(', '),
      }))

      return data.reduce((acc, cur) => {
        acc += `*[${cur.typeName}]*\n`;
        acc += cur.options + '\n';
        return acc;
      }, '');
    }

    const getGenderKor = (gender: string) => gender === Gender.FEMALE ? "여성" : "남성";

    const requesterPreferences = getSimpleStringPreferences(requester.preferences);
    const matcherPreferences = getSimpleStringPreferences(matcher.preferences);

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "✨ 새로운 매칭이 생성되었습니다",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*매칭 유형:*\n" + (type === 'admin' ? '관리자 매칭' : '자동 매칭')
          },
          {
            type: "mrkdwn",
            text: "*매칭 점수:*\n" + `*\`${(similarity * 100).toFixed(2)}%\`*`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*매칭 요청자:*\n" + `${requester.name} (랭크: *${requester.rank}*)\n${requester.age}세 ${getGenderKor(requester.gender)}\n ${requesterPreferences}`
          },
          {
            type: "mrkdwn",
            text: "*매칭 대상:*\n" + `${matcher.name} (랭크: *${matcher.rank}*)\n${matcher.age}세 ${getGenderKor(matcher.gender)}\n ${matcherPreferences}`
          }
        ]
      }
    ];

    await this.slack.chat.postMessage({
      channel: '매칭-테스트-로그',
      blocks,
      text: "새로운 매칭이 생성되었습니다", // 알림이 꺼져있을 때 보이는 텍스트
      username: '썸타임 봇',
      icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
    });
  }

  /**
   * 회원가입 알림을 슬랙으로 전송합니다.
   * @param signupData 회원가입 정보
   */
  async sendSignupNotification(signupData: SignupRequest) {
    this.logger.debug(`Sending signup notification for ${signupData.name}`);

    // 성별 한글 변환 함수
    const getGenderKor = (gender: Gender) => gender === Gender.FEMALE ? "여성" : "남성";

    // 날짜 포맷팅
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 슬랙 블록 구성
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 새로운 회원이 가입했습니다!",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*가입 시간:*\n" + formattedDate
          },
          {
            type: "mrkdwn",
            text: "*이름:*\n" + signupData.name
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*이메일:*\n" + signupData.email
          },
          {
            type: "mrkdwn",
            text: "*전화번호:*\n" + signupData.phoneNumber
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*나이:*\n" + `${signupData.age}세`
          },
          {
            type: "mrkdwn",
            text: "*성별:*\n" + getGenderKor(signupData.gender)
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*대학교:*\n" + signupData.universityName
          },
          {
            type: "mrkdwn",
            text: "*학과:*\n" + signupData.departmentName
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*학년:*\n" + signupData.grade
          },
          {
            type: "mrkdwn",
            text: "*학번:*\n" + signupData.studentNumber
          }
        ]
      }
    ];

    // MBTI가 있는 경우 추가
    if (signupData.mbti) {
      blocks.push({
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*MBTI:*\n" + signupData.mbti
          },
          {
            type: "mrkdwn",
            text: "*인스타그램:*\n" + (signupData.instagramId || "없음")
          }
        ]
      });
    }

    // 프로필 이미지 수 추가
    if (signupData.profileImages && signupData.profileImages.length > 0) {
      blocks.push({
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*프로필 이미지:*\n${signupData.profileImages.length}개 업로드됨`
          }
        ]
      });
    }

    // 슬랙 메시지 전송
    await this.slack.chat.postMessage({
      channel: '썸타임-회원가입-알림',
      blocks,
      text: `${signupData.name}님이 회원가입했습니다.`, // 알림이 꺼져있을 때 보이는 텍스트
      username: '썸타임 봇',
      icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
    });
  }
}
