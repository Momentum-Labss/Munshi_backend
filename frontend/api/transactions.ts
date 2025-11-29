import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

// Transaction types
export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  weight?: number;
  isLoose: boolean;
}

export interface Transaction {
  id: string;
  userId: number;
  totalAmount: number;
  mode: 'CASH' | 'UPI' | 'UDHAAR';
  customerId?: string;
  createdAt: string;
  items: TransactionItem[];
}

export interface GetTransactionsResponse {
  success: boolean;
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get transactions with filters
export const getTransactions = async (params?: {
  page?: number;
  limit?: number;
  mode?: 'CASH' | 'UPI' | 'UDHAAR';
  startDate?: string;
  endDate?: string;
}): Promise<GetTransactionsResponse> => {
  const response = await apiClient.get('/sale/transaction', { params });
  return response.data;
};

// Custom hook for transactions
export const useTransactions = (params?: {
  page?: number;
  limit?: number;
  mode?: 'CASH' | 'UPI' | 'UDHAAR';
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    staleTime: 30000,
    retry: 2,
  });
};

// Hook for today's transactions only
export const useTodayTransactions = (limit: number = 10) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useQuery({
    queryKey: ['transactions', 'today', limit],
    queryFn: () =>
      getTransactions({
        limit,
        page: 1,
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      }),
    staleTime: 10000, // 10 seconds for fresh data
    retry: 2,
  });
};
