import axios from 'axios';
import { axiosHandler } from '@/common/helper/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8044/api';

export interface SalesTrendPoint {
  label: string;
  amount: number;
  count: number;
}

export interface CustomPeriodRequest {
  startDate: string;
  endDate: string;
}

export interface TotalSalesResponse {
  totalSales: number;
  totalCount: number;
}

export interface DailySalesResponse {
  dailySales: number;
  dailyCount: number;
}

export interface WeeklySalesResponse {
  weeklySales: number;
  weeklyCount: number;
}

export interface MonthlySalesResponse {
  monthlySales: number;
  monthlyCount: number;
}

export interface CustomPeriodSalesResponse {
  totalSales: number;
  totalCount: number;
  startDate: string;
  endDate: string;
}

export interface DailySalesTrendResponse {
  data: SalesTrendPoint[];
}

export interface WeeklySalesTrendResponse {
  data: SalesTrendPoint[];
}

export interface MonthlySalesTrendResponse {
  data: SalesTrendPoint[];
}

export interface CustomPeriodSalesTrendResponse {
  data: SalesTrendPoint[];
  startDate: string;
  endDate: string;
}

export interface PaymentSuccessRateResponse {
  date: string;
  totalAttempts: number;
  successfulPayments: number;
  successRate: number;
}

export const SalesStatsService = {
  // 총 매출액 조회
  getTotalSales: async (): Promise<TotalSalesResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/total`);
      return response.data;
    });
  },

  // 일간 매출액 조회
  getDailySales: async (): Promise<DailySalesResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/daily`);
      return response.data;
    });
  },

  // 주간 매출액 조회
  getWeeklySales: async (): Promise<WeeklySalesResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/weekly`);
      return response.data;
    });
  },

  // 월간 매출액 조회
  getMonthlySales: async (): Promise<MonthlySalesResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/monthly`);
      return response.data;
    });
  },

  // 사용자 지정 기간 매출액 조회
  getCustomPeriodSales: async (params: CustomPeriodRequest): Promise<CustomPeriodSalesResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/stats/sales/custom-period`, params);
      return response.data;
    });
  },

  // 일별 매출 추이 조회
  getDailySalesTrend: async (): Promise<DailySalesTrendResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/trend/daily`);
      return response.data;
    });
  },

  // 주별 매출 추이 조회
  getWeeklySalesTrend: async (): Promise<WeeklySalesTrendResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/trend/weekly`);
      return response.data;
    });
  },

  // 월별 매출 추이 조회
  getMonthlySalesTrend: async (): Promise<MonthlySalesTrendResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/trend/monthly`);
      return response.data;
    });
  },

  // 사용자 지정 기간 매출 추이 조회
  getCustomPeriodSalesTrend: async (params: CustomPeriodRequest): Promise<CustomPeriodSalesTrendResponse> => {
    return axiosHandler(async () => {
      const response = await axios.post(`${API_URL}/admin/stats/sales/trend/custom-period`, params);
      return response.data;
    });
  },

  // 결제 성공률 조회
  getPaymentSuccessRate: async (): Promise<PaymentSuccessRateResponse> => {
    return axiosHandler(async () => {
      const response = await axios.get(`${API_URL}/admin/stats/sales/success-rate`);
      return response.data;
    });
  },
};
