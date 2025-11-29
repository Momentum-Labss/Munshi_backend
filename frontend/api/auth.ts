// api/auth.ts

import { SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import apiClient from './client';

// Send OTP to email
export const sendOTP = async (data: SendOTPRequest): Promise<SendOTPResponse> => {
    const response = await apiClient.post('/auth/send-otp', data);
    return response.data;
};

// Verify OTP
export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);

    // Store token in secure storage
    if (response.data.token) {
        await SecureStore.setItemAsync('authToken', response.data.token);
    }

    return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
    await SecureStore.deleteItemAsync('authToken');
};

// Custom hooks using TanStack Query
export const useSendOTP = () => {
    return useMutation({
        mutationFn: sendOTP,
        onSuccess: (data) => {
            console.log('OTP sent successfully:', data);
        },
        onError: (error) => {
            console.error('Failed to send OTP:', error);
        },
    });
};

export const useVerifyOTP = () => {
    return useMutation({
        mutationFn: verifyOTP,
        onSuccess: (data) => {
            console.log('OTP verified successfully:', data);
        },
        onError: (error) => {
            console.error('Failed to verify OTP:', error);
        },
    });
};