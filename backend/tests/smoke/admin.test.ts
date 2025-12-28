/**
 * Admin API Smoke Tests
 * 
 * Tests admin/staff-only endpoints
 */

import { testClient } from '../utils/testClient';

describe('Admin API Smoke Tests', () => {
  describe('Authentication Requirements', () => {
    it('GET /admin/dashboard/stats should require auth', async () => {
      const response = await testClient.get('/admin/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('GET /admin/users should require auth', async () => {
      const response = await testClient.get('/admin/users');

      expect(response.status).toBe(401);
    });

    it('GET /admin/cases should require auth', async () => {
      const response = await testClient.get('/admin/cases');

      expect(response.status).toBe(401);
    });

    it('GET /admin/audit-logs should require auth', async () => {
      const response = await testClient.get('/admin/audit-logs');

      expect(response.status).toBe(401);
    });
  });

  describe('Patient Search', () => {
    it('GET /admin/patients/search should require auth', async () => {
      const response = await testClient.get('/admin/patients/search?q=test');

      expect(response.status).toBe(401);
    });
  });

  describe('Case Management', () => {
    it('POST /admin/cases should require auth', async () => {
      const response = await testClient.post('/admin/cases', {
        patientId: 'test-uuid',
        diagnosis: 'Test',
      });

      expect(response.status).toBe(401);
    });

    it('PUT /admin/cases/:id should require auth', async () => {
      const response = await testClient.put('/admin/cases/test-uuid', {
        diagnosis: 'Updated',
      });

      expect(response.status).toBe(401);
    });
  });
});

describe('Doctor API Smoke Tests', () => {
  describe('Authentication Requirements', () => {
    it('GET /doctor/dashboard should require auth', async () => {
      const response = await testClient.get('/doctor/dashboard');

      expect(response.status).toBe(401);
    });

    it('GET /doctor/cases should require auth', async () => {
      const response = await testClient.get('/doctor/cases');

      expect(response.status).toBe(401);
    });

    it('GET /doctor/patients should require auth', async () => {
      const response = await testClient.get('/doctor/patients');

      expect(response.status).toBe(401);
    });
  });
});

