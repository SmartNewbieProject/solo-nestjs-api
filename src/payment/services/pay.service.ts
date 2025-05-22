import { Injectable, HttpException, HttpStatus, BadGatewayException, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentConfirm } from "../dto";
import { PayBeforeHistory, PaymentDetails, PortOneCustomData, Product } from "@/types/payment";
import { PortoneWebhookDto, PortonePaymentStatus } from "../dto/webhook.dto";
import PayRepository from "../repository/pay.repository";
import { PortOneClient } from '@portone/server-sdk';
import { TicketService } from "./ticket.service";
import { axiosHandler } from "@/common/helper";
import { createHmac } from 'crypto';
import axios from "axios";
import { SlackService } from "@/slack-notification/slack.service";
import UserRepository from "@/user/repository/user.repository";
import weekDateService from "@/matching/domain/date";

const productMap: Record<Product, { price: number }> = {
  [Product.REMATCHING]: {
    price: 4000,
  },
}

const TOKEN_GETTER_URL = 'https://api.iamport.kr/users/getToken';

@Injectable()
export default class PayService {
  private readonly logger = new Logger(PayService.name);
  private readonly client: PortOneClient;
  private readonly impId: string;
  private readonly restKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly payRepository: PayRepository,
    private readonly ticketService: TicketService,
    private readonly slackService: SlackService,
    private readonly userRepository: UserRepository,
  ) {
    this.client = PortOneClient({ secret: configService.get('PORTONE_SECRET_KEY') as string });
    this.impId = configService.get('PORTONE_IMP_ID') as string;
    this.restKey = configService.get('PORTONE_REST_API_KEY') as string;
    this.secretKey = configService.get('PORTONE_SECRET_KEY') as string;
  }

  async createHistory(payBefore: PayBeforeHistory) {
    return await this.payRepository.createHistory(payBefore);
  }

  async confirmClientPayment(userId: string, { impUid, merchantUid }: PaymentConfirm) {
    const history = await this.payRepository.findPayHistory(merchantUid);
    if (!history) {
      throw new BadGatewayException('결제 내역을 찾을 수 없습니다.');
    }
    if (history.userId !== userId) {
      throw new UnauthorizedException('본인의 결제만 확인할 수 있습니다.');
    }

    try {
      const accessToken = await this.getServiceToken();
      const { response: portOnePayment } = await this.getPayment(impUid, accessToken) as { response: PaymentDetails };

      if (portOnePayment.status === 'paid') {
        await this.payRepository.updateHistory(merchantUid, {
          receiptUrl: portOnePayment.receipt_url,
          paidAt: weekDateService.createDayjs().toDate(),
          method: portOnePayment.emb_pg_provider,
          txId: portOnePayment.pg_tid,
        });

        await this.sendPaymentSlackNotification(
          userId,
          history.orderName,
          history.amount,
          portOnePayment.emb_pg_provider || '알 수 없음',
          new Date(portOnePayment.paid_at)
        );
      }
    } catch (error) {
      this.logger.error(`결제 확인 중 오류 발생: ${error.message}`);
    }

    return history;
  }

  verifyPortoneSignature(signature: string, webhookData: PortoneWebhookDto): boolean {
    if (!signature) return false;

    const rawBody = JSON.stringify(webhookData);
    const hmac = createHmac('sha256', this.secretKey);
    const generatedSignature = hmac.update(rawBody).digest('hex');

    return signature === generatedSignature;
  }

  private async sendPaymentSlackNotification(
    userId: string,
    orderName: string,
    amount: number,
    method: string,
    paidAt: Date
  ) {
    try {
      const user = await this.userRepository.getUser(userId);
      const userName = user?.name || '알 수 없음';

      await this.slackService.sendPaymentNotification(
        userId,
        userName,
        orderName,
        amount,
        method,
        paidAt
      );
      return true;
    } catch (error) {
      this.logger.error(`슬랙 알림 전송 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  async handlePaymentWebhook(webhookData: PortoneWebhookDto) {
    const { imp_uid, merchant_uid, status } = webhookData;

    if (status !== PortonePaymentStatus.PAID) {
      return { success: false, message: '결제 완료 상태가 아님' };
    }

    try {
      const history = await this.payRepository.findPayHistory(merchant_uid);
      if (!history) {
        this.logger.error(`결제 내역을 찾을 수 없습니다: ${merchant_uid}`);
        return { success: false, message: '결제 내역을 찾을 수 없음' };
      }

      const accessToken = await this.getServiceToken();
      const { response: portOnePayment } = await this.getPayment(imp_uid, accessToken) as { response: PaymentDetails };

      let customData: PortOneCustomData;
      try {
        customData = JSON.parse(JSON.parse(portOnePayment.custom_data as string));
      } catch (error) {
        this.logger.error('결제 데이터 파싱 실패');
        throw new BadGatewayException('결제 데이터가 올바르지 않습니다.');
      }

      if (history.orderName !== customData.orderName) {
        this.logger.error(`결제 내용이 변조되었습니다.`);
        throw new BadGatewayException('결제 내용이 변조되었습니다.');
      }

      await this.payRepository.updateHistory(merchant_uid, {
        receiptUrl: portOnePayment.receipt_url,
        paidAt: new Date(portOnePayment.paid_at),
        method: portOnePayment.emb_pg_provider,
        txId: portOnePayment.pg_tid,
      });

      await this.strategy(history.userId, customData.orderName as Product, customData);

      const notificationSent = await this.sendPaymentSlackNotification(
        history.userId,
        history.orderName,
        history.amount,
        portOnePayment.emb_pg_provider || '알 수 없음',
        new Date(portOnePayment.paid_at)
      );

      return {
        success: true,
        notificationSent
      };
    } catch (error) {
      this.logger.error(`결제 웹훅 처리 중 오류 발생: ${error.message}`);
      throw error;
    }
  }

  private strategy(userId: string, product: Product, customData: PortOneCustomData) {
    if (product === Product.REMATCHING) {
      return this.ticketService.createRematchingTickets(userId, customData.productCount);
    }
  }

  private async getServiceToken(): Promise<string> {
    return await axiosHandler(async () => {
      const response = await axios.post(TOKEN_GETTER_URL, {
        imp_key: this.restKey,
        imp_secret: this.secretKey,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.response.access_token;
    }, error => {
      this.logger.error(error);
      throw new BadGatewayException('결제 서버 오류입니다');
    }) as Promise<string>;
  }

  private async getPayment(impUid: string, token: string) {
    return await axiosHandler(async () => {
      const response = await axios.get(`https://api.iamport.kr/payments/${impUid}`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    }, error => {
      this.logger.error(error);
      throw new BadGatewayException('결제 서버 오류입니다');
    }) as Promise<any>;
  }
}
