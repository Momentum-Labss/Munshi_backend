import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

// Customer/Udhaar types
export interface UdhaarCustomer {
  id: string;
  name: string;
  phone: string;
  currentDebt: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomersResponse {
  success: boolean;
  data: UdhaarCustomer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get customers with filters
export const getCustomers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PAID' | 'UNPAID' | 'ALL';
}): Promise<GetCustomersResponse> => {
  const response = await apiClient.get('/uddhar/customers', { params });
  return response.data;
};

// Custom hook for customers
export const useCustomers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PAID' | 'UNPAID' | 'ALL';
}) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params),
    staleTime: 30000,
    retry: 2,
  });
};

// Hook for unpaid udhaars only
export const useUnpaidUdhaars = (limit: number = 5) => {
  return useQuery({
    queryKey: ['customers', 'unpaid', limit],
    queryFn: () => getCustomers({ status: 'UNPAID', limit, page: 1 }),
    staleTime: 30000,
    retry: 2,
  });
};
