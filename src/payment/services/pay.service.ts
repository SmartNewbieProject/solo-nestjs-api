import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentConfirm } from "../dto";
import tossPayment from "../domain/toss";
import { axiosHandler } from "@/common/helper/axios";
import { PayBeforeHistory } from "@/types/payment";
import PayRepository from "../repository/pay.repository";

@Injectable()
export default class PayService {
  private readonly clientKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly payRepository: PayRepository,
  ) {
    this.clientKey = Buffer.from(this.configService.get<string>('TOSS_PAYMENTS_SECRET_KEY') + ':').toString('base64');
  }

  async createHistory(payBefore: PayBeforeHistory) {
    return await this.payRepository.createHistory(payBefore);
  }

  async pay(userId: string, payment: PaymentConfirm) {
    return await axiosHandler(async () => {
      await tossPayment.confirm(payment, this.clientKey);
    }, (error) => {
      console.log(error);
      const errorBody = JSON.parse((error.response?.data as any).message as string);
      throw new HttpException(errorBody, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }

}
