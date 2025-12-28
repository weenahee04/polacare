/**
 * Health Check Smoke Tests
 * 
 * Verifies the API is up and running
 */

import { testClient } from '../utils/testClient';

describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const response = await fetch(
      `${process.env.API_BASE_URL || 'http://localhost:5000'}/health`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
  });

  it('should return database status', async () => {
    const response = await fetch(
      `${process.env.API_BASE_URL || 'http://localhost:5000'}/health`
    );
    
    const data = await response.json();
    expect(data).toHaveProperty('database');
  });

  it('should include timestamp', async () => {
    const response = await fetch(
      `${process.env.API_BASE_URL || 'http://localhost:5000'}/health`
    );
    
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
  });
});

describe('API Version', () => {
  it('GET /api/v1 endpoints should be available', async () => {
    const response = await testClient.get('/auth/profile');
    
    // Should return 401 (unauthorized), not 404 (not found)
    expect(response.status).toBe(401);
  });
});

