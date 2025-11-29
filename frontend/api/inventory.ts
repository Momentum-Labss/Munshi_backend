import { useQuery } from '@tanstack/react-query';
import apiClient from './client';

// Response types based on backend
export interface InventoryProduct {
  id: string;
  name: string;
  type: 'LOOSE' | 'PACKAGED';
  stock: number;
  unit: string;
  lowStockThreshold: number;
  price: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetInventoryResponse {
  success: boolean;
  data: InventoryProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get inventory with filters and pagination
export const getInventory = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'LOOSE' | 'PACKAGED';
  lowStock?: boolean;
}): Promise<GetInventoryResponse> => {
  const response = await apiClient.get('/inventory', { params });
  return response.data;
};

// Custom hook for inventory
export const useInventory = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'LOOSE' | 'PACKAGED';
  lowStock?: boolean;
}) => {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventory(params),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
};

// Hook for low stock items only
export const useLowStockItems = (limit: number = 5) => {
  return useQuery({
    queryKey: ['inventory', 'low-stock', limit],
    queryFn: () => getInventory({ lowStock: true, limit, page: 1 }),
    staleTime: 30000,
    retry: 2,
  });
};
