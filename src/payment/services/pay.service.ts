import { Injectable, HttpException, HttpStatus, BadGatewayException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentConfirm } from "../dto";
import { PayBeforeHistory, PortOneCustomData, Product } from "@/types/payment";
import PayRepository from "../repository/pay.repository";
import { PaymentClient, PortOneClient } from '@portone/server-sdk';
import { TicketService } from "./ticket.service";

const productMap: Record<Product, { price: number }> = {
  [Product.REMATCHING]: {
    price: 2000,
  },
}

@Injectable()
export default class PayService {
  private readonly logger = new Logger(PayService.name);
  private readonly clientKey: string;
  private readonly client: PortOneClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly payRepository: PayRepository,
    private readonly ticketService: TicketService,
  ) {
    this.clientKey = Buffer.from(this.configService.get<string>('TOSS_PAYMENTS_SECRET_KEY') + ':').toString('base64');
    this.client = PortOneClient({ secret: configService.get('PORTONE_SECRET_KEY') as string });
  }

  async createHistory(payBefore: PayBeforeHistory) {
    return await this.payRepository.createHistory(payBefore);
  }

  async pay(userId: string, payment: PaymentConfirm) {
    const history = await this.payRepository.findPayHistory(payment.orderId);
    const portOnePayment = await this.client.payment.getPayment({ paymentId: payment.orderId });

    if (portOnePayment.status !== 'PAID') {
      throw new BadGatewayException(`결제 상태가 아닙니다. [${portOnePayment.status.toString}]`);
    }

    if (payment.txId !== portOnePayment.transactionId) {
      throw new BadGatewayException('트랜잭션 아이디가 일치하지 않습니다.');
    }
    const customData = JSON.parse(portOnePayment.customData as string) as PortOneCustomData;
    this.logger.debug({
      history,
      customData,
    })
    if (history?.orderName !== customData.orderName && history?.orderId === customData.orderId) {
      this.logger.error(`결제 내용이 변조되었습니다.`);
      throw new BadGatewayException('결제 내용이 변조되었습니다.');
    }
  
    await this.strategy(userId, customData.orderName as Product, customData);
    await this.payRepository.updateHistory(payment.orderId, {
      receiptUrl: portOnePayment.receiptUrl,
      paidAt: new Date(),
      txId: payment.txId,
    });
  }

  private strategy(userId: string, product: Product, customData: PortOneCustomData) {
    const price = productMap[product].price;
    const productCount = customData.amount / price;

    if (product === Product.REMATCHING) {
      return this.ticketService.createRematchingTickets(userId, productCount);
    }
  }

}
