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
  orderId: string;
  amount: number;
  orderName: string;
}
