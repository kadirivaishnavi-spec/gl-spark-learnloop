import api from "./api";
import type { RegisterRequest, LoginRequest, LoginResponse, User } from "../types/user";

export async function registerUser(data: RegisterRequest): Promise<void> {
    await api.post("/api/users/register", data);
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/api/users/login", data);
    return response.data;
}

export async function getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
}