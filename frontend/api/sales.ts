// api/sales.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from './client';

// API Response types based on your backend
export interface SuggestionProduct {
    id: string;
    name: string;
    type: 'Loose' | 'Packaged';
    icon: string;
    price: number;
    score: number;
    weight?: number; // For loose items
}

export interface GetSuggestionsResponse {
    success: boolean;
    data: {
        packagedSuggestion: SuggestionProduct[];
        looseSuggestion: SuggestionProduct[];
    };
}

// Transaction types
export interface TransactionItem {
    productId: string;
    name: string;
    price: number;
    quantity?: number; // For packaged items
    weight?: number; // For loose items
    isLoose: boolean;
}

export interface CreateTransactionRequest {
    items: TransactionItem[];
    totalAmount: number;
    mode: 'CASH' | 'UPI' | 'UDHAAR';
    customerId?: string;
}

export interface CreateTransactionResponse {
    success: boolean;
    message: string;
    transactionId: string;
    nudges?: any[];
}

// Customer types
export interface CreateCustomerRequest {
    name: string;
    phone: string;
}

export interface CreateCustomerResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        phone: string;
        currentDebt: number;
    };
}

// Get product suggestions based on price
export const getSuggestions = async (price: number): Promise<GetSuggestionsResponse> => {
    const response = await apiClient.get(`/sale/get-suggestion`, {
        params: { price }
    });
    return response.data;
};

// Create customer for udhaar
export const createCustomer = async (data: CreateCustomerRequest): Promise<CreateCustomerResponse> => {
    const response = await apiClient.post('/uddhar/customer', data);
    return response.data;
};

// Create transaction
export const createTransaction = async (data: CreateTransactionRequest, force: boolean = false): Promise<CreateTransactionResponse> => {
    const response = await apiClient.post('/sale/transaction', data, {
        params: { force }
    });
    return response.data;
};

// Custom hook using TanStack Query
export const useGetSuggestions = (price: number | undefined, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['suggestions', price],
        queryFn: () => getSuggestions(price!),
        enabled: enabled && price !== undefined && price > 0,
        staleTime: 30000, // Cache for 30 seconds
        retry: 1,
    });
};

// Custom hook for creating customer
export const useCreateCustomer = () => {
    return useMutation({
        mutationFn: createCustomer,
    });
};

// Custom hook for creating transaction
export const useCreateTransaction = () => {
    return useMutation({
        mutationFn: ({ data, force }: { data: CreateTransactionRequest; force?: boolean }) =>
            createTransaction(data, force),
    });
};
