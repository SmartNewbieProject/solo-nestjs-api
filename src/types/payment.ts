export type PayBeforeHistory = {
  userId: string;
  orderId: string;
  orderName: string;
  amount: number;
};

export enum Product {
  REMATCHING = '연인 재매칭권',
}

export type PortOneCustomData = {
  amount: number;
  orderName: string;
  productType: string;
  productCount: number;
};

export type CustomData = {
  orderName: string;
  amount: number;
  productType: string;
};

export type PaymentDetails = {
  amount: number;
  apply_num: string | null;
  bank_code: string | null;
  bank_name: string | null;
  buyer_addr: string;
  buyer_email: string | null;
  buyer_name: string;
  buyer_postcode: string | null;
  buyer_tel: string;
  cancel_amount: number;
  cancel_history: any[];
  cancel_reason: string | null;
  cancel_receipt_urls: string[];
  cancelled_at: number;
  card_code: string | null;
  card_name: string | null;
  card_number: string | null;
  card_quota: number;
  card_type: string | null;
  cash_receipt_issued: boolean;
  channel: string;
  currency: string;
  custom_data: string;
  customer_uid: string | null;
  customer_uid_usage: string | null;
  emb_pg_provider: string;
  escrow: boolean;
  fail_reason: string | null;
  failed_at: number;
  imp_uid: string;
  merchant_uid: string;
  name: string;
  paid_at: number;
  pay_method: string;
  pg_id: string;
  pg_provider: string;
  pg_tid: string;
  receipt_url: string;
  started_at: number;
  status: string;
  user_agent: string;
  vbank_code: string | null;
  vbank_date: number;
  vbank_holder: string | null;
  vbank_issued_at: number;
  vbank_name: string | null;
  vbank_num: string | null;
};

export type PaymentMethodType = 'PaymentMethodEasyPay';
export type PaymentChannelType = 'TEST';
export type PaymentStatus = 'READY' | 'PAID';
export type PaymentVersion = 'V2';

export interface PaymentMethod {
  type: PaymentMethodType;
  provider: string;
  easyPayMethod: {
    type: string;
  };
}

export interface PaymentChannel {
  type: PaymentChannelType;
  id: string;
  key: string;
  name: string;
  pgProvider: string;
  pgMerchantId: string;
}

export interface PaymentWebhook {
  paymentStatus: PaymentStatus;
  id: string;
  status: string;
  url: string;
  isAsync: boolean;
  currentExecutionCount: number;
  request: {
    header: string;
    body: string;
    requestedAt: string;
  };
  response: {
    code: string;
    header: string;
    body: string;
    respondedAt: string;
  };
  triggeredAt: string;
}

export interface PaymentAmount {
  total: number;
  taxFree: number;
  vat: number;
  supply: number;
  discount: number;
  paid: number;
  cancelled: number;
  cancelledTaxFree: number;
}

export interface PaymentCustomer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface PortOnePaymentV2 {
  status: PaymentStatus;
  id: string;
  transactionId: string;
  merchantId: string;
  storeId: string;
  method: PaymentMethod;
  channel: PaymentChannel;
  version: PaymentVersion;
  webhooks: PaymentWebhook[];
  requestedAt: string;
  updatedAt: string;
  statusChangedAt: string;
  orderName: string;
  amount: PaymentAmount;
  currency: string;
  customer: PaymentCustomer;
  promotionId: string;
  isCulturalExpense: boolean;
  customData: string;
  paidAt: string;
  pgTxId: string;
  pgResponse: string;
  receiptUrl: string;
  disputes: any[];
}
