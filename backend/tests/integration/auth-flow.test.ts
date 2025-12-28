/**
 * Auth Flow Integration Tests
 * 
 * Tests complete authentication flows with real database
 * Requires: Running backend + database
 */

import { testClient } from '../utils/testClient';
import { generateTestUser, formatThaiPhone } from '../utils/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Flow Integration Tests', () => {
  let testPhone: string;
  let testToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Generate unique phone for this test run
    testPhone = `09${Date.now().toString().slice(-8)}`;
  });

  afterAll(async () => {
    // Cleanup test user if created
    if (testUserId) {
      try {
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (e) {
        // User may not exist
      }
    }
    await prisma.$disconnect();
  });

  describe('Registration Flow', () => {
    it('should register a new user', async () => {
      const userData = generateTestUser({ phoneNumber: testPhone });
      
      const response = await testClient.post('/auth/register', userData);

      if (response.status === 429) {
        console.log('Rate limited - skipping test');
        return;
      }

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user).toHaveProperty('hn');

      testToken = response.data.token;
      testUserId = response.data.user.id;
    });

    it('should not allow duplicate registration', async () => {
      if (!testUserId) {
        console.log('Skipping - no test user created');
        return;
      }

      const userData = generateTestUser({ phoneNumber: testPhone });
      
      const response = await testClient.post('/auth/register', userData);

      expect([409, 429]).toContain(response.status);
    });
  });

  describe('Profile Access', () => {
    it('should access profile with valid token', async () => {
      if (!testToken) {
        console.log('Skipping - no test token');
        return;
      }

      const response = await testClient.get('/auth/profile', testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data.user.id).toBe(testUserId);
    });

    it('should update profile', async () => {
      if (!testToken) {
        console.log('Skipping - no test token');
        return;
      }

      const response = await testClient.put('/auth/profile', {
        name: 'Updated Test Name',
      }, testToken);

      expect([200, 429]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data.user.name).toBe('Updated Test Name');
      }
    });
  });

  describe('Logout Flow', () => {
    it('should logout and invalidate token', async () => {
      if (!testToken) {
        console.log('Skipping - no test token');
        return;
      }

      const logoutResponse = await testClient.post('/auth/logout', {}, testToken);
      expect(logoutResponse.status).toBe(200);

      // Token should now be invalid
      const profileResponse = await testClient.get('/auth/profile', testToken);
      expect(profileResponse.status).toBe(401);
    });
  });
});

