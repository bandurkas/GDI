import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * CSRF Protection Utility
 * Prevents Cross-Site Request Forgery attacks on mutation endpoints
 */

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

/**
 * Generate a CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const cookieStore = await cookies();

    // Set cookie with secure options
    cookieStore.set(CSRF_TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
    });

    return token;
}

/**
 * Get the current CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * Validate CSRF token from request headers
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
    // Get token from header
    const headerToken = request.headers.get('x-csrf-token');

    if (!headerToken) {
        return false;
    }

    // Get token from cookie
    const cookieToken = await getCsrfToken();

    if (!cookieToken) {
        return false;
    }

    // Compare tokens (timing-safe)
    return crypto.timingSafeEqual(
        Buffer.from(headerToken),
        Buffer.from(cookieToken)
    );
}

/**
 * Middleware to check CSRF token on mutation requests
 * Use this in API routes that modify data (POST, PUT, PATCH, DELETE)
 */
export async function requireCsrfToken(request: Request): Promise<void> {
    const isValid = await validateCsrfToken(request);

    if (!isValid) {
        throw new Error('Invalid CSRF token');
    }
}

/**
 * Client-side helper to get CSRF token for fetch requests
 * Call this from the client to get the token to include in headers
 */
export async function getClientCsrfToken(): Promise<string> {
    const response = await fetch('/api/csrf');
    const data = await response.json();
    return data.token;
}
