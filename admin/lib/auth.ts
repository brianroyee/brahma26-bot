import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

// Simple session token (no JWT complexity)
export const SIMPLE_SESSION_TOKEN = "brahma26-authorized-session";

export function createAccessToken(): string {
    return SIMPLE_SESSION_TOKEN;
}

export function validateToken(token: string): boolean {
    return token === SIMPLE_SESSION_TOKEN;
}
