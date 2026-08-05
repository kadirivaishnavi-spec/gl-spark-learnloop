import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const TOKEN_KEY = "learnloop_token";

// Simple event system so AuthContext can react to a 401 the moment it happens,
// instead of only finding out on the next render/navigation.
type SessionExpiredListener = () => void;
const listeners: SessionExpiredListener[] = [];

export function onSessionExpired(listener: SessionExpiredListener) {
    listeners.push(listener);
    return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
    };
}

// Attach JWT token to every outgoing request, if we have one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, clear the stored token and notify the app so it can redirect immediately.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            listeners.forEach((listener) => listener());
        }
        return Promise.reject(error);
    }
);

// Convert backend errors into a consistent, friendly message
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        if (!axiosError.response) {
            return "Network error. Please check your connection or the server may be down.";
        }

        const status = axiosError.response.status;
        const data = axiosError.response.data;

        const backendMessage =
            (typeof data === "string" && data) ||
            data?.message ||
            data?.error;

        switch (status) {
            case 400:
                return backendMessage || "Invalid request. Please check your input.";
            case 401:
                return "Your session has expired. Please log in again.";
            case 403:
                return "You don't have permission to do that.";
            case 404:
                return backendMessage || "The requested resource was not found.";
            case 409:
                return backendMessage || "This already exists or conflicts with existing data.";
            case 500:
                return "Something went wrong on the server. Please try again later.";
            default:
                return backendMessage || "An unexpected error occurred.";
        }
    }
    return "An unexpected error occurred.";
}

export default api;