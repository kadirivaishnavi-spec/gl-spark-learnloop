export interface DecodedToken {
    sub?: string;       // usually email or username
    userId?: number;
    id?: number;
    exp?: number;        // expiry timestamp (seconds)
    [key: string]: unknown; // backend may include other custom claims
}