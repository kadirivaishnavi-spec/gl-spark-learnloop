export interface User {
    id: number;
    name: string;
    email: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    // Add more fields here later ONLY if your backend actually returns them
    // (e.g. userId, name, email). For now we only assume `token` is guaranteed.
}