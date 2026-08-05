import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "../types/auth";
import { loginUser } from "../services/userService";
import { onSessionExpired } from "../services/api";
import type { LoginRequest } from "../types/user";

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    userId: number | null;
    userEmail: string | null;
    sessionExpired: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "learnloop_token";

function decodeAndValidate(token: string): DecodedToken | null {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return null; // expired
        }
        return decoded;
    } catch {
        return null; // malformed token
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored && decodeAndValidate(stored)) {
            return stored;
        }
        if (stored) localStorage.removeItem(TOKEN_KEY); // clean up expired token
        return null;
    });

    const [decoded, setDecoded] = useState<DecodedToken | null>(() =>
        token ? decodeAndValidate(token) : null
    );

    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        if (token) {
            setDecoded(decodeAndValidate(token));
        } else {
            setDecoded(null);
        }
    }, [token]);

    // Listen for 401s from any API call, anywhere in the app
    useEffect(() => {
        const unsubscribe = onSessionExpired(() => {
            setToken(null);
            setSessionExpired(true);
        });
        return unsubscribe;
    }, []);

    async function login(data: LoginRequest) {
        const response = await loginUser(data);
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setSessionExpired(false);
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setSessionExpired(false);
    }

    function clearSessionExpired() {
        setSessionExpired(false);
    }

    const value: AuthContextType = {
        token,
        isAuthenticated: !!token,
        userId: (decoded?.userId as number) ?? (decoded?.id as number) ?? null,
        userEmail: (decoded?.sub as string) ?? null,
        sessionExpired,
        login,
        logout,
        clearSessionExpired,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}