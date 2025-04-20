import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import coolSms from 'coolsms-node-sdk';

// CoolSMS SDK 타입 정의
type MessageService = {
  sendOne: (params: {
    to: string;
    from: string;
    text: string;
    type?: 'SMS' | 'LMS' | 'MMS';
  }) => Promise<{
    groupId: string;
    messageId: string;
    to: string;
    from: string;
    type: string;
    statusMessage: string;
  }>;
};

@Injectable()
export default class SmsService {
  private smsClient: MessageService;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey = configService.get('COOL_SMS_API_KEY');
    const secretKey = configService.get('COOL_SMS_SECRET_KEY');
    this.smsClient = new coolSms(apiKey, secretKey) as unknown as MessageService;
  }

  async sendSms(to: string, text: string) {
    try {
      const result = await this.smsClient.sendOne({
        to,
        from: this.configService.get('SMS_SENDER_NUMBER')!,
        text,
        type: 'SMS'
      });
      
      return result;
    } catch (error) {
      throw new Error(`SMS 발송 실패: ${error.message}`);
    }
  }

}
