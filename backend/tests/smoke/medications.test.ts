/**
 * Medications API Smoke Tests
 * 
 * Tests medication tracking endpoints
 */

import { testClient } from '../utils/testClient';
import { generateTestMedication } from '../utils/testData';

describe('Medications API Smoke Tests', () => {
  describe('GET /medications', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/medications');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await testClient.get('/medications', 'bad-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /medications/status', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/medications/status');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /medications/adherence/rate', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/medications/adherence/rate');

      expect(response.status).toBe(401);
    });

    it('should accept days parameter format', async () => {
      // Just verify endpoint exists and accepts parameter
      const response = await testClient.get('/medications/adherence/rate?days=7');

      expect(response.status).toBe(401); // Auth required
    });
  });

  describe('GET /medications/history', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/medications/history');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /medications', () => {
    it('should require authentication', async () => {
      const medication = generateTestMedication();
      const response = await testClient.post('/medications', medication);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /medications/:id', () => {
    it('should require authentication', async () => {
      const response = await testClient.put('/medications/some-uuid', {
        medicineName: 'Updated Name',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /medications/:id', () => {
    it('should require authentication', async () => {
      const response = await testClient.delete('/medications/some-uuid');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /medications/:id/log', () => {
    it('should require authentication', async () => {
      const response = await testClient.post('/medications/some-uuid/log', {});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /medications/:id/logs', () => {
    it('should require authentication', async () => {
      const response = await testClient.get('/medications/some-uuid/logs');

      expect(response.status).toBe(401);
    });
  });
});

