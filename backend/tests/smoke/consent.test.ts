/**
 * Consent API Smoke Tests
 * 
 * Tests PDPA consent endpoints
 */

import { testClient } from '../utils/testClient';

describe('Consent API Smoke Tests', () => {
  describe('GET /consents', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/consents');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await testClient.get('/consents', 'invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /consents/versions', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/consents/versions');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /consents/check', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/consents/check');

      expect(response.status).toBe(401);
    });

    it('should accept type parameter', async () => {
      const response = await testClient.get('/consents/check?type=terms');

      // Should be 401 (auth required), not 400 (bad request)
      expect(response.status).toBe(401);
    });
  });

  describe('POST /consents', () => {
    it('should require authentication', async () => {
      const response = await testClient.post('/consents', {
        consentType: 'terms',
        version: '1.0'
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /consents/:type', () => {
    it('should require authentication', async () => {
      const response = await testClient.delete('/consents/marketing');

      expect(response.status).toBe(401);
    });
  });
});

