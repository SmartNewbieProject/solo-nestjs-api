import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { Gender } from '@/types/enum';
import { PreferenceTypeGroup, ProfileDetails, ProfileSummary, UserProfile } from '@/types/user';

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
      const data = groups.map(({ typeName, selectedOptions  }) => ({
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
            text: "*매칭 요청자:*\n" + `${requester.name}\n${requester.age}세 ${getGenderKor(requester.gender)}\n ${requesterPreferences}`
          },
          {
            type: "mrkdwn",
            text: "*매칭 대상:*\n" + `${matcher.name}\n${matcher.age}세 ${getGenderKor(matcher.gender)}\n ${matcherPreferences}`
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
}
