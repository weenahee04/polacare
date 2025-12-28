/**
 * Auth API Smoke Tests
 * 
 * Tests authentication endpoints
 */

import { testClient } from '../utils/testClient';
import { generateTestUser, formatThaiPhone } from '../utils/testData';

describe('Auth API Smoke Tests', () => {
  describe('POST /auth/otp/request', () => {
    it('should accept valid phone number', async () => {
      const response = await testClient.post('/auth/otp/request', {
        phoneNumber: '0812345678',
      });

      // Should succeed or be rate limited (both are valid responses)
      expect([200, 429]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data).toHaveProperty('message');
        expect(response.data).toHaveProperty('phoneNumber');
      }
    });

    it('should reject empty phone number', async () => {
      const response = await testClient.post('/auth/otp/request', {
        phoneNumber: '',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid phone format', async () => {
      const response = await testClient.post('/auth/otp/request', {
        phoneNumber: '123', // Too short
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/otp/verify', () => {
    it('should reject invalid OTP', async () => {
      const response = await testClient.post('/auth/otp/verify', {
        phoneNumber: '0812345678',
        code: '000000', // Invalid code
      });

      expect([401, 429]).toContain(response.status);
    });

    it('should reject missing OTP code', async () => {
      const response = await testClient.post('/auth/otp/verify', {
        phoneNumber: '0812345678',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should validate required fields', async () => {
      const response = await testClient.post('/auth/register', {
        phoneNumber: '0812345678',
        // Missing required fields
      });

      expect(response.status).toBe(400);
    });

    it('should validate password length', async () => {
      const user = generateTestUser({ password: '123' }); // Too short
      const response = await testClient.post('/auth/register', user);

      expect(response.status).toBe(400);
    });

    it('should validate gender enum', async () => {
      const user = generateTestUser({ gender: 'Invalid' as any });
      const response = await testClient.post('/auth/register', user);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await testClient.get('/auth/profile', 'invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject malformed token', async () => {
      const response = await testClient.get('/auth/profile', 'not.a.jwt');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /auth/profile', () => {
    it('should require authentication', async () => {
      const response = await testClient.put('/auth/profile', { name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should require authentication', async () => {
      const response = await testClient.post('/auth/logout', {});

      expect(response.status).toBe(401);
    });
  });
});

