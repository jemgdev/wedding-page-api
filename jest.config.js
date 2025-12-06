/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testMatch: ['<rootDir>/src/**/unit/*.test.ts'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.serverless/',
    '<rootDir>/undefined/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ],
  coverageThreshold: {
    global: { statements: 80, functions: 80, branches: 80, lines: 80 }
  },
  silent: false,
  detectOpenHandles: true,
  verbose: true,
  cache: false,
  moduleNameMapper: {
    // Comment paths
    '^@comment/value-objects/(.*)$': '<rootDir>/src/comment/domain/value-objects/$1',
    '^@comment/domain/(.*)$': '<rootDir>/src/comment/domain/$1',
    '^@comment/application/(.*)$': '<rootDir>/src/comment/application/$1',
    '^@comment/usecases/(.*)$': '<rootDir>/src/comment/application/usecases/$1',
    '^@comment/ports/(.*)$': '<rootDir>/src/comment/application/ports/$1',
    '^@comment/infrastructure/(.*)$': '<rootDir>/src/comment/infrastructure/$1',
    '^@comment/driven/(.*)$': '<rootDir>/src/comment/infrastructure/driven/$1',
    '^@comment/driving/(.*)$': '<rootDir>/src/comment/infrastructure/driving/$1',
    '^@comment/(.*)$': '<rootDir>/src/comment/$1',

    // Shared paths
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  }
}
