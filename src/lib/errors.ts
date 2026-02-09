/**
 * Custom error classes for consistent error handling
 */

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code: string = "INTERNAL_ERROR"
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication required") {
        super(message, 401, "AUTHENTICATION_ERROR");
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Insufficient permissions") {
        super(message, 403, "AUTHORIZATION_ERROR");
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
    }
}

export class InsufficientFundsError extends AppError {
    constructor(message: string = "Insufficient wallet balance") {
        super(message, 400, "INSUFFICIENT_FUNDS");
    }
}

/**
 * Format error response for API
 */
export interface ErrorResponse {
    error: string;
    code: string;
    details?: any;
}

export function formatErrorResponse(error: unknown): {
    response: ErrorResponse;
    status: number;
} {
    // Handle our custom errors
    if (error instanceof AppError) {
        return {
            response: {
                error: error.message,
                code: error.code
            },
            status: error.statusCode
        };
    }

    // Handle Prisma errors
    if (isPrismaError(error)) {
        return formatPrismaError(error);
    }

    // Handle Zod validation errors
    if (isZodError(error)) {
        return {
            response: {
                error: "Validation failed",
                code: "VALIDATION_ERROR",
                details: error.errors
            },
            status: 400
        };
    }

    // Generic error (don't expose details)
    console.error("Unexpected error:", error);
    return {
        response: {
            error: "An unexpected error occurred",
            code: "INTERNAL_ERROR"
        },
        status: 500
    };
}

/**
 * Check if error is from Prisma
 */
function isPrismaError(error: any): error is { code: string; meta?: any } {
    return error && typeof error.code === 'string' && error.code.startsWith('P');
}

/**
 * Format Prisma errors to user-friendly messages
 */
function formatPrismaError(error: { code: string; meta?: any }): {
    response: ErrorResponse;
    status: number;
} {
    switch (error.code) {
        case 'P2002': // Unique constraint failed
            const field = error.meta?.target?.[0] || 'field';
            return {
                response: {
                    error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                    code: "DUPLICATE_ENTRY"
                },
                status: 409
            };

        case 'P2025': // Record not found
            return {
                response: {
                    error: "Record not found",
                    code: "NOT_FOUND"
                },
                status: 404
            };

        case 'P2003': // Foreign key constraint failed
            return {
                response: {
                    error: "Related record not found",
                    code: "INVALID_REFERENCE"
                },
                status: 400
            };

        default:
            console.error("Unhandled Prisma error:", error);
            return {
                response: {
                    error: "Database error occurred",
                    code: "DATABASE_ERROR"
                },
                status: 500
            };
    }
}

/**
 * Check if error is from Zod
 */
function isZodError(error: any): error is { errors: any[] } {
    return error && Array.isArray(error.errors) && error.name === 'ZodError';
}
