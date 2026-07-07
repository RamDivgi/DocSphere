export interface User {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    full_name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}