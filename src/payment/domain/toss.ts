import { PaymentConfirm } from '../dto';
import axios from 'axios';

const tossPayment = {
  confirm(paymentConfirm: PaymentConfirm, clientKey: string) {
    return axios.post('https://api.tosspayments.com/v1/payments/confirm', {
      headers: {
        Authorization: `Basic ${clientKey}`,
        'Content-Type': 'application/json',
      },
      data: paymentConfirm,
    });
  },
};

export default tossPayment;
