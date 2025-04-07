export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__test__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
