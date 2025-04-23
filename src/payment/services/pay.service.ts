import { Injectable, HttpException, HttpStatus, BadGatewayException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentConfirm } from "../dto";
import { PayBeforeHistory, PaymentDetails, PortOneCustomData, Product } from "@/types/payment";
import PayRepository from "../repository/pay.repository";
import { PortOneClient } from '@portone/server-sdk';
import { TicketService } from "./ticket.service";
import { axiosHandler } from "@/common/helper";
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

  async pay(userId: string, { impUid, merchantUid }: PaymentConfirm) {
    const history = await this.payRepository.findPayHistory(merchantUid);
    const accessToken = await this.getServiceToken();
    this.logger.log({ accessToken });
    
    const { response: portOnePayment } = await this.getPayment(impUid, accessToken) as { response: PaymentDetails };
    this.logger.debug({ portOnePayment });

    if (portOnePayment.status === 'failed') {
      throw new BadGatewayException(`결제가 실패했어요. 다시시도해주세요.`);
    }
    if (portOnePayment.status !== 'paid') {
      throw new BadGatewayException(`결제 상태가 아닙니다.`);
    }

    const customData = JSON.parse(portOnePayment.custom_data as string) as PortOneCustomData;
    this.logger.debug({ history, customData });
    if (
      history?.orderName !== customData.orderName
    ) {
      this.logger.error(`결제 내용이 변조되었습니다.`);
      throw new BadGatewayException('결제 내용이 변조되었습니다.');
    }
    await this.payRepository.updateHistory(merchantUid, {
      receiptUrl: portOnePayment.receipt_url,
      paidAt: new Date(portOnePayment.paid_at),
      method: portOnePayment.emb_pg_provider,
      txId: portOnePayment.pg_tid,
    });

    this.strategy(userId, customData.orderName as Product, customData);
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
      // this.logger.error(error);
      throw new BadGatewayException('결제 서버 오류입니다');
    }) as Promise<any>;
  }

}
