/**
 * Jest Test Setup
 * 
 * This file runs before all tests
 */

import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.JWT_EXPIRES_IN = '1h';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests (keep errors and warnings)
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Cleanup after all tests
afterAll(async () => {
  // Allow time for connections to close
  await new Promise(resolve => setTimeout(resolve, 500));
});

