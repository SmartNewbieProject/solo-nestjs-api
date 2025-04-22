export type PayBeforeHistory = {
  userId: string;
  orderId: string;
  orderName: string;
  amount: number;
}

export enum Product {
  REMATCHING = '연인 재매칭권',
}


export type PortOneCustomData = {
  amount: number;
  orderName: string;
  productType: string;
  productCount: number;
}

export type CustomData = {
  orderName: string;
  amount: number;
  productType: string;
}

// amount: 1000,
// apply_num: null,
// bank_code: null,
// bank_name: null,
// buyer_addr: '',
// buyer_email: null,
// buyer_name: '휴대폰인증',
// buyer_postcode: null,
// buyer_tel: '01026554276',
// cancel_amount: 0,
// cancel_history: [],
// cancel_reason: null,
// cancel_receipt_urls: [],
// cancelled_at: 0,
// card_code: null,
// card_name: null,
// card_number: null,
// card_quota: 0,
// card_type: null,
// cash_receipt_issued: false,
// channel: 'pc',
// currency: 'KRW',
// custom_data: '{"orderName":"연인 재매칭권","amount":1000,"productType":"TICKET"}',
// customer_uid: null,
// customer_uid_usage: null,
// emb_pg_provider: 'kakaopay',
// escrow: false,
// fail_reason: null,
// failed_at: 0,
// imp_uid: 'imp_069873402672',
// merchant_uid: '1965e10a76c',
// name: '연인 재매칭권',
// paid_at: 1745334891,
// pay_method: 'point',
// pg_id: 'welcometst',
// pg_provider: 'welcome',
// pg_tid: 'WPCStdCARDwelcometst20250423001450659967',
// receipt_url: 'https://twbiz.paywelcome.co.kr/mCmReceipt_head.jsp?noTid=WPCStdCARDwelcometst20250423001450659967&noMethod=1',
// started_at: 1745334873,
// status: 'paid',
// user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0',
// vbank_code: null,
// vbank_date: 0,
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