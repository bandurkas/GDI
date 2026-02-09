import { formatErrorResponse, ValidationError, NotFoundError, ConflictError, InsufficientFundsError } from '@/lib/errors';

describe('Error Handling', () => {
    describe('formatErrorResponse', () => {
        it('should format ValidationError correctly', () => {
            const error = new ValidationError('Invalid email format');
            const { response, status } = formatErrorResponse(error);

            expect(status).toBe(400);
            expect(response.error).toBe('Invalid email format');
            expect(response.code).toBe('VALIDATION_ERROR');
        });

        it('should format NotFoundError correctly', () => {
            const error = new NotFoundError('User');
            const { response, status } = formatErrorResponse(error);

            expect(status).toBe(404);
            expect(response.error).toBe('User not found');
            expect(response.code).toBe('NOT_FOUND');
        });

        it('should format ConflictError correctly', () => {
            const error = new ConflictError('Email already exists');
            const { response, status } = formatErrorResponse(error);

            expect(status).toBe(409);
            expect(response.error).toBe('Email already exists');
            expect(response.code).toBe('CONFLICT');
        });

        it('should format InsufficientFundsError correctly', () => {
            const error = new InsufficientFundsError();
            const { response, status } = formatErrorResponse(error);

            expect(status).toBe(400);
            expect(response.error).toBe('Insufficient wallet balance');
            expect(response.code).toBe('INSUFFICIENT_FUNDS');
        });

        it('should handle Prisma P2002 error (unique constraint)', () => {
            const prismaError = {
                code: 'P2002',
                meta: { target: ['email'] }
            };

            const { response, status } = formatErrorResponse(prismaError);

            expect(status).toBe(409);
            expect(response.error).toBe('Email already exists');
            expect(response.code).toBe('DUPLICATE_ENTRY');
        });

        it('should handle Prisma P2025 error (record not found)', () => {
            const prismaError = {
                code: 'P2025'
            };

            const { response, status } = formatErrorResponse(prismaError);

            expect(status).toBe(404);
            expect(response.error).toBe('Record not found');
            expect(response.code).toBe('NOT_FOUND');
        });

        it('should handle generic errors safely', () => {
            const genericError = new Error('Some database connection failure');
            const { response, status } = formatErrorResponse(genericError);

            expect(status).toBe(500);
            expect(response.error).toBe('An unexpected error occurred');
            expect(response.code).toBe('INTERNAL_ERROR');
            // Should not leak specific error details
            expect(response.error).not.toContain('database');
            expect(response.error).not.toContain('connection');
        });
    });
});
