import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { Gender } from '@/types/enum';
import { PreferenceTypeGroup, UserProfile } from '@/types/user';
import { SignupRequest } from '@/auth/dto';

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

  async sendNotification(message: string, channel: string = '썸타임-운영알림') {
    await this.slack.chat.postMessage({
      channel,
      text: message,
      username: '썸타임 봇',
      icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
    });
  }

  async sendErrorNotification(error: Error, context: string) {
    const message = `🚨 Error in ${context}:\n\`\`\`${error.stack}\`\`\``;
    await this.sendNotification(message, 'errors');
  }

  async sendMatchingNotification(userId: string, partnerId: string, similarity: number) {
    const message = `✨ New Match Created!\nUser: ${userId}\nPartner: ${partnerId}\nSimilarity: ${similarity.toFixed(2)}`;
    await this.sendNotification(message, 'matching');
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
      channel: '썸타임-운영알림',
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
      channel: '썸타임-운영알림',
      blocks,
      text: `${signupData.name}님이 회원가입했습니다.`, // 알림이 꺼져있을 때 보이는 텍스트
      username: '썸타임 봇',
      icon_url: 'https://i.pinimg.com/736x/03/78/fe/0378febd3b192bd1a8dd10335fd1f718.jpg',
    });
  }
}
