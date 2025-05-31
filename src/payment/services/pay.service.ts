import { Injectable, HttpException, HttpStatus, BadGatewayException, Logger, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentConfirm } from "../dto";
import { PayBeforeHistory, PaymentDetails, PortOneCustomData, PortOnePaymentV2, Product } from "@/types/payment";
import { PortoneWebhookDto, PortonePaymentStatus } from "../dto/webhook.dto";
import PayRepository from "../repository/pay.repository";
import { Payment, PortOneClient } from '@portone/server-sdk';
import { TicketService } from "./ticket.service";
import { axiosHandler } from "@/common/helper";
import { createHmac } from 'crypto';
import axios from "axios";
import { SlackService } from "@/slack-notification/slack.service";
import UserRepository from "@/user/repository/user.repository";
import weekDateService from "@/matching/domain/date";

const TOKEN_GETTER_URL = 'https://api.iamport.kr/users/getToken';

@Injectable()
export default class PayService {
  private readonly logger = new Logger(PayService.name);
  private readonly client: PortOneClient;
  private readonly storeId: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly payRepository: PayRepository,
    private readonly ticketService: TicketService,
    private readonly slackService: SlackService,
    private readonly userRepository: UserRepository,
  ) {
    const secretKey = configService.get('PORTONE_V2_SECRET_KEY') as string;
    this.client = PortOneClient({ secret: secretKey });
    this.secretKey = secretKey;
    this.storeId = configService.get('PORTONE_STORE_ID') as string;
  }

  async createHistory(payBefore: PayBeforeHistory) {
    return await this.payRepository.createHistory(payBefore);
  }

  async confirmClientPayment(userId: string, { merchantUid }: PaymentConfirm) {
    const history = await this.payRepository.findPayHistory(merchantUid);
    if (!history) {
      throw new BadRequestException('결제 내역을 찾을 수 없습니다.');
    }
    if (history.userId !== userId) {
      throw new UnauthorizedException('본인의 결제만 확인할 수 있습니다.');
    }

    try {
      const { response: portOnePayment } = await this.getPayment(merchantUid) as { response: PaymentDetails };
      this.logger.debug(portOnePayment);

      if (['paid', 'PAID'].includes(portOnePayment.status)) {
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
      this.logger.error(`결제 확인 중 오류 발생`);
      this.logger.error(error);
    }

    return history;
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
    const { payment_id, status } = webhookData;
    this.logger.debug(webhookData);

    if (status !== PortonePaymentStatus.PAID) {
      return { success: false, message: '결제 완료 상태가 아님' };
    }

    try {
      const history = await this.payRepository.findPayHistory(payment_id);
      if (!history) {
        this.logger.error(`결제 내역을 찾을 수 없습니다: ${payment_id}`);
        return { success: false, message: '결제 내역을 찾을 수 없음' };
      }

      const payment = await this.getPayment(payment_id) as PortOnePaymentV2;

      this.logger.debug('결제 내역 조회');
      this.logger.debug(payment);
      const customData = JSON.parse(payment.customData);

      if (history.orderName !== payment.orderName) {
        this.logger.error(`결제 내용이 변조되었습니다.`);
        throw new BadGatewayException('결제 내용이 변조되었습니다.');
      }

      await this.payRepository.updateHistory(payment_id, {
        receiptUrl: payment.receiptUrl,
        paidAt: weekDateService.createDayjs().toDate(),
        method: payment.method.provider,
        txId: payment.pgTxId,
      });

      await this.strategy(history.userId, payment.orderName as Product, customData);

      const notificationSent = await this.sendPaymentSlackNotification(
        history.userId,
        history.orderName,
        history.amount,
        payment.method.provider || '알 수 없음',
        weekDateService.createDayjs().toDate(),
      );

      return {
        success: true,
        notificationSent
      };
    } catch (error) {
      this.logger.error(`결제 웹훅 처리 중 오류 발생: `);
      this.logger.error(error);
      throw error;
    }
  }

  private strategy(userId: string, product: Product, customData: PortOneCustomData) {
    if (product === Product.REMATCHING) {
      return this.ticketService.createRematchingTickets(userId, customData.productCount);
    }
  }
  private async getPayment(paymentId: string) {
    return this.getPaymentByPaymentId(paymentId);
  }

  // private async getPaymentByPaymentId(paymentId: string): Promise<Payment.Payment> {
  private async getPaymentByPaymentId(paymentId: string): Promise<any> {
    this.logger.debug(`[getPaymentByPaymentId] paymentId: ${paymentId}`);
    const storeId = this.configService.get('PORTONE_STORE_ID') as string;
    return await this.client.payment.getPayment({ paymentId, storeId });
  }
}
