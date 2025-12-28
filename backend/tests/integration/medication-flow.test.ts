/**
 * Medication Flow Integration Tests
 * 
 * Tests complete medication management flows
 * Requires: Running backend + database + authenticated user
 */

import { testClient } from '../utils/testClient';
import { generateTestUser, generateTestMedication } from '../utils/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Medication Flow Integration Tests', () => {
  let testToken: string;
  let testUserId: string;
  let testMedicationId: string;

  beforeAll(async () => {
    // Create a test user and get token
    const testPhone = `09${Date.now().toString().slice(-8)}`;
    const userData = generateTestUser({ phoneNumber: testPhone });
    
    const response = await testClient.post('/auth/register', userData);
    
    if (response.status === 201) {
      testToken = response.data.token;
      testUserId = response.data.user.id;
    }
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      try {
        // Delete medications first (cascade should handle it, but just in case)
        await prisma.medication.deleteMany({ where: { patientId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    await prisma.$disconnect();
  });

  describe('Medication CRUD', () => {
    it('should create a medication', async () => {
      if (!testToken) {
        console.log('Skipping - no test token');
        return;
      }

      const medication = generateTestMedication();
      const response = await testClient.post('/medications', medication, testToken);

      if (response.status === 429) {
        console.log('Rate limited - skipping');
        return;
      }

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('medication');
      expect(response.data.medication).toHaveProperty('id');
      expect(response.data.medication.medicineName).toBe(medication.medicineName);

      testMedicationId = response.data.medication.id;
    });

    it('should list medications', async () => {
      if (!testToken) return;

      const response = await testClient.get('/medications', testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('medications');
      expect(Array.isArray(response.data.medications)).toBe(true);
    });

    it('should get medications with status', async () => {
      if (!testToken) return;

      const response = await testClient.get('/medications/status', testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('medications');
    });

    it('should update medication', async () => {
      if (!testToken || !testMedicationId) return;

      const response = await testClient.put(`/medications/${testMedicationId}`, {
        frequency: '2 times/day',
      }, testToken);

      if (response.status === 429) return;

      expect(response.status).toBe(200);
      expect(response.data.medication.frequency).toBe('2 times/day');
    });
  });

  describe('Medication Logging', () => {
    it('should log medication as taken', async () => {
      if (!testToken || !testMedicationId) return;

      const response = await testClient.post(`/medications/${testMedicationId}/log`, {
        notes: 'Taken with water',
      }, testToken);

      if (response.status === 429) return;

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('log');
      expect(response.data.log.taken).toBe(true);
    });

    it('should get medication logs', async () => {
      if (!testToken || !testMedicationId) return;

      const response = await testClient.get(`/medications/${testMedicationId}/logs`, testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('logs');
      expect(response.data).toHaveProperty('pagination');
    });

    it('should get medication history', async () => {
      if (!testToken) return;

      const response = await testClient.get('/medications/history', testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('logs');
    });

    it('should get adherence rate', async () => {
      if (!testToken) return;

      const response = await testClient.get('/medications/adherence/rate?days=7', testToken);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('adherence');
      expect(response.data.adherence).toHaveProperty('rate');
      expect(response.data.adherence).toHaveProperty('periodDays');
    });
  });

  describe('Medication Deletion', () => {
    it('should delete medication', async () => {
      if (!testToken || !testMedicationId) return;

      const response = await testClient.delete(`/medications/${testMedicationId}`, testToken);

      if (response.status === 429) return;

      expect(response.status).toBe(200);
    });

    it('should not find deleted medication', async () => {
      if (!testToken || !testMedicationId) return;

      const response = await testClient.get('/medications', testToken);
      
      const found = response.data.medications?.find(
        (m: any) => m.id === testMedicationId
      );
      
      expect(found).toBeUndefined();
    });
  });
});

