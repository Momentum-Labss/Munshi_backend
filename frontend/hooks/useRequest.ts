import axios from "axios";
import * as SecureStore from 'expo-secure-store';

// Android emulators cannot access localhost - use 10.0.2.2 to reach host machine
const API = 'http://10.197.61.79:3000/api'

const getAuthToken = async () => {
    const authToken = await SecureStore.getItemAsync('authToken')
    return authToken
}

// General Request Handler for API calls (GET, POST, PUT, DELETE)
export const apiRequest = async (
    method: 'post' | 'put' | 'get' | 'delete',
    apiPath: string,
    data?: any,
    headers?: any
) => {
    const authToken = await getAuthToken()

    const config = {
        method,
        maxBodyLength: Infinity,
        url: `${API}/${apiPath}`,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
            Authorization: `Bearer ${authToken}`,
        },
        data,
    }

    try {
        const response = await axios.request(config)
        return response.data
    } catch (error: any) {
        // console.error('API Request failed:', error)

        // Extract user-friendly error message without stack trace
        let errorMessage = 'An unexpected error occurred. Please try again.'

        if (error.response) {
            // Server responded with error status
            const status = error.response.status
            const message = error.response.data?.message || error.response.data?.error

            if (message) {
                errorMessage = message
            } else {
                // Fallback to generic messages based on status code
                if (status === 400) {
                    errorMessage = 'Invalid request. Please check your input.'
                } else if (status === 401) {
                    errorMessage = 'Unauthorized. Please log in again.'
                } else if (status === 403) {
                    errorMessage = 'Access forbidden.'
                } else if (status === 404) {
                    errorMessage = 'Resource not found.'
                } else if (status === 500) {
                    errorMessage = 'Server error. Please try again later.'
                } else if (status >= 500) {
                    errorMessage = 'Server error. Please try again later.'
                }
            }
        } else if (error.request) {
            // Request made but no response received
            errorMessage = 'Network error. Please check your connection.'
        }

        // Throw clean error object with user-friendly message only
        const cleanError = new Error(errorMessage)
        throw cleanError
    }
}
