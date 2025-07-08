import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import PayRepository from '@/payment/repository/pay.repository';
import { GemPaymentCreation, PaymentConfirm } from '@/payment/dto';
import { PortOneClient } from '@portone/server-sdk';
import { ConfigService } from '@nestjs/config';
import { PaidPayment } from '@portone/server-sdk/dist/generated/payment';
import { GemRepository } from '@/payment/repository/gem.repository';
import {
  PortonePaymentStatus,
  PortoneWebhookDto,
} from '@/payment/dto/webhook.dto';
import { GemTransactionManager } from '@/payment/services/gem-transaction-manager';

type CustomData = {
  productName: string;
};

@Injectable()
export class GemPaymentService {
  private readonly client: PortOneClient;
  private readonly storeId: string;
  private readonly logger = new Logger(GemPaymentService.name);

  constructor(
    private readonly payRepository: PayRepository,
    private readonly configService: ConfigService,
    private readonly gemRepository: GemRepository,
    private readonly transactionManager: GemTransactionManager,
  ) {
    const secretKey = configService.get('PORTONE_SECRET_KEY') as string;
    this.client = PortOneClient({ secret: secretKey });
    this.storeId = this.configService.get('PORTONE_STORE_ID') as string;
  }

  async confirm(
    userId: string,
    confirmation: PaymentConfirm,
  ): Promise<PaidPayment> {
    const payment = await this.validateAndGet(userId, confirmation.merchantUid);
    await this.createGemPayment(userId, payment);
    return payment;
  }

  async handleWebHook({ payment_id, status }: PortoneWebhookDto) {
    if (status !== PortonePaymentStatus.PAID) {
      this.logger.error(
        `웹훅을 수신받았지만, ${payment_id} 에 대해 ${status} 상태임`,
      );
      return;
    }
    const payment = await this.getPayment(payment_id);
    const history = await this.payRepository.findPayHistory(payment_id);
    if (payment.status !== 'PAID' || !history) {
      this.logger.error(`${payment_id} 가 결제된 상태가 아님`);
      this.logger.error(payment.status);
      return;
    }
    const product = await this.gemRepository.getProductByName(
      payment.orderName,
    );
    if (!product) {
      this.logger.error(`${payment.orderName} product가 존재하지 않습니다.`);
      return;
    }

    await this.transactionManager.charge(history.userId, product.totalGems);
  }

  private async validateAndGet(userId: string, orderId: string) {
    const history = await this.payRepository.findPayHistory(orderId);
    if (!history) {
      throw new BadRequestException('결제 내역을 찾을 수 없습니다.');
    }
    if (history.userId !== userId) {
      throw new UnauthorizedException('본인의 결제만 확인할 수 있습니다.');
    }

    const payment = await this.getPayment(orderId);
    // TODO: 간혹 결제해도 결제처리가 안되는 유저가 있는데, 여기 status 가 PAID 가 아닌 상태로 넘어올 가능성을 체크해봐야함
    if (payment.status !== 'PAID') {
      throw new BadRequestException('결제가 완료되지 않았습니다.');
    }

    return payment;
  }

  private async createGemPayment(userId: string, portOnePayment: PaidPayment) {
    if (!portOnePayment?.customData) {
      throw new BadRequestException('customData 가 없습니다.');
    }
    const { productName } = portOnePayment.customData as unknown as CustomData;
    const product = await this.gemRepository.getProductByName(productName);
    if (!product) {
      throw new NotFoundException(`${productName} 상품이 존재하지 않습니다.`);
    }

    const { receiptUrl, amount, status, method, transactionId } =
      portOnePayment;

    const gemPaymentCreation: GemPaymentCreation = {
      transactionId,
      amount,
      method,
      status,
      productId: product.id,
      receiptUrl,
    };

    await this.gemRepository.insertGemPayment(userId, gemPaymentCreation);

    return gemPaymentCreation;
  }

  private async getPayment(paymentId: string) {
    return await this.client.payment.getPayment({
      paymentId,
      storeId: this.storeId,
    });
  }
}
