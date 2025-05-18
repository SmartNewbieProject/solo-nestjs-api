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
    return history;
  }

  verifyPortoneSignature(signature: string, webhookData: PortoneWebhookDto): boolean {
    if (!signature) return false;

    const rawBody = JSON.stringify(webhookData);
    const hmac = createHmac('sha256', this.secretKey);
    const generatedSignature = hmac.update(rawBody).digest('hex');

    return signature === generatedSignature;
  }

  async handlePaymentWebhook(webhookData: PortoneWebhookDto) {
    this.logger.debug({ webhookData });
    const { imp_uid, merchant_uid, status } = webhookData;
    
    const history = await this.payRepository.findPayHistory(merchant_uid);
    if (!history) {
      this.logger.error(`결제 내역을 찾을 수 없습니다: ${merchant_uid}`);
      return;
    }

    if (status === PortonePaymentStatus.PAID) {
      const accessToken = await this.getServiceToken();
      const { response: portOnePayment } = await this.getPayment(imp_uid, accessToken) as { response: PaymentDetails };

      let customData: PortOneCustomData;
      try {
        customData = JSON.parse(JSON.parse(portOnePayment.custom_data as string));
      } catch (error) {
        this.logger.error('결제 데이터 파싱 실패:', error);
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
    }
  }

  private strategy(userId: string, product: Product, customData: PortOneCustomData) {
    const price = productMap[product].price;
    const productCount = customData.productCount;
    this.logger.debug({ price, productCount });

    if (product === Product.REMATCHING) {
      return this.ticketService.createRematchingTickets(userId, productCount);
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
