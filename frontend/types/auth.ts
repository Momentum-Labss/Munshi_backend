// types/auth.ts

export interface SendOTPRequest {
    email: string;
}

export interface SendOTPResponse {
    success: boolean;
    message: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}

export interface VerifyOTPResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt?: string;
}