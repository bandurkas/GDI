import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'node', // Use node for integration tests with Prisma
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.tsx',
        '**/tests/**/*.test.ts',
        '**/tests/**/*.test.tsx',
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/__tests__/**',
    ],
    // Separate projects for different test types
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'jsdom',
            testMatch: ['**/tests/unit/**/*.test.ts'],
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
            },
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch: ['**/tests/integration/**/*.test.ts'],
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
            },
        },
    ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
