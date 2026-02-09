import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

/**
 * CSRF Token endpoint
 * GET /api/csrf - Returns a CSRF token for the client
 */
export async function GET() {
    try {
        const token = await generateCsrfToken();

        return NextResponse.json({
            token
        });
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        return NextResponse.json(
            { error: 'Failed to generate CSRF token' },
            { status: 500 }
        );
    }
}
