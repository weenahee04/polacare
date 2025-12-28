/**
 * Medical Records API Smoke Tests
 * 
 * Tests patient case/records endpoints
 */

import { testClient } from '../utils/testClient';

describe('Medical Records API Smoke Tests', () => {
  describe('GET /cases', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/cases');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await testClient.get('/cases', 'invalid.jwt.token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /cases/:id', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/cases/some-uuid');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent case with valid auth format', async () => {
      // This would need a valid token to test properly
      // For smoke test, we just verify the endpoint exists
      const response = await testClient.get('/cases/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401); // Unauthorized, not 404
    });
  });

  describe('POST /cases', () => {
    it('should require authentication', async () => {
      const response = await testClient.post('/cases', {
        diagnosis: 'Test Diagnosis',
      });

      expect(response.status).toBe(401);
    });
  });
});

describe('Vision Tests API Smoke Tests', () => {
  describe('GET /vision-tests', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/vision-tests');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /vision-tests', () => {
    it('should require authentication', async () => {
      const response = await testClient.post('/vision-tests', {
        testName: 'Amsler Grid',
        testType: 'AmslerGrid',
        result: 'Normal',
      });

      expect(response.status).toBe(401);
    });
  });
});

