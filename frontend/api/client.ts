// api/client.ts

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base API URL - Update this with your actual API URL
const API_BASE_URL = 'http://10.197.61.79:3000/api';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error reading auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            await SecureStore.deleteItemAsync('authToken');
            // You can add navigation logic here later
        }

        return Promise.reject(error);
    }
);

export default apiClient;