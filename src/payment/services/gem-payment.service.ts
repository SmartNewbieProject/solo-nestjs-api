import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import PayRepository from '@/payment/repository/pay.repository';
import { GemPaymentCreation, PaymentConfirm } from '@/payment/dto';
import { PortOneClient } from '@portone/server-sdk';
import { ConfigService } from '@nestjs/config';
import { PaidPayment } from '@portone/server-sdk/dist/generated/payment';
import { GemRepository } from '@/payment/repository/gem.repository';

type CustomData = {
  productName: string;
};

@Injectable()
export class GemPaymentService {
  private readonly client: PortOneClient;
  private readonly storeId: string;

  constructor(
    private readonly payRepository: PayRepository,
    private readonly configService: ConfigService,
    private readonly gemRepository: GemRepository,
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

  private async validateAndGet(userId: string, orderId: string) {
    const history = await this.payRepository.findPayHistory(orderId);
    if (!history) {
      throw new BadRequestException('결제 내역을 찾을 수 없습니다.');
    }
    if (history.userId !== userId) {
      throw new UnauthorizedException('본인의 결제만 확인할 수 있습니다.');
    }

    const payment = await this.getPayment(orderId);
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
