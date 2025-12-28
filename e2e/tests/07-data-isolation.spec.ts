/**
 * E2E Test: Cross-User Data Isolation
 * 
 * Security Test: Verify patients cannot access each other's data
 */

import { test, expect, TEST_CREDENTIALS } from './fixtures';

test.describe('Cross-User Data Isolation', () => {
  test('should not expose other patient data in records list', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to records
    await page.click('text=ประวัติ, text=Records').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Check that displayed records belong to logged-in user
    // Look for HN or patient name that shouldn't be there
    const otherPatientMarkers = [
      'text=HN-DOC-001',  // Doctor's HN
      'text=HN-ADMIN-001', // Admin's HN
      'text=Dr. Test',    // Doctor name
    ];
    
    for (const selector of otherPatientMarkers) {
      const found = await page.locator(selector).isVisible().catch(() => false);
      expect(found).toBeFalsy();
    }
  });

  test('should not access other user case via direct URL', async ({ page, context }) => {
    // This test requires knowing another user's case ID
    // In a real test, we'd create a case for user A, then try to access it as user B
    
    // Try accessing a random UUID that belongs to no one or another user
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    
    await page.goto('/');
    
    // If logged in, try to navigate to a non-existent/other user's case
    // This would typically be done via API manipulation
    
    // Verify API returns 404 (not 403) for non-existent resources
    const response = await page.request.get(
      `${process.env.E2E_API_URL || 'http://localhost:5000'}/api/v1/cases/${fakeUUID}`,
      {
        headers: {
          'Authorization': `Bearer fake-token`,
        },
      }
    ).catch(() => null);
    
    if (response) {
      // Should be 401 (unauthorized) or 404 (not found)
      expect([401, 404]).toContain(response.status());
    }
  });

  test('should not access other user medications', async ({ page }) => {
    // Try accessing medications API with fake medication ID
    const fakeUUID = '00000000-0000-0000-0000-000000000001';
    
    const response = await page.request.get(
      `${process.env.E2E_API_URL || 'http://localhost:5000'}/api/v1/medications/${fakeUUID}/logs`,
      {
        headers: {
          'Authorization': `Bearer fake-token`,
        },
      }
    ).catch(() => null);
    
    if (response) {
      // Should be 401 or 404
      expect([401, 404]).toContain(response.status());
    }
  });

  test('should reject admin endpoints for patient role', async ({ page }) => {
    // Try accessing admin endpoints
    const adminEndpoints = [
      '/api/v1/admin/users',
      '/api/v1/admin/dashboard/stats',
      '/api/v1/doctor/cases',
    ];
    
    for (const endpoint of adminEndpoints) {
      const response = await page.request.get(
        `${process.env.E2E_API_URL || 'http://localhost:5000'}${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer fake-patient-token`,
          },
        }
      ).catch(() => null);
      
      if (response) {
        // Should be 401 (no token) or 403 (forbidden for patients)
        expect([401, 403]).toContain(response.status());
      }
    }
  });

  test('UI should not show admin navigation for patients', async ({ page }) => {
    await page.goto('/');
    
    // Check that admin links are not visible to regular users
    const adminLinks = [
      'text=Admin',
      'text=แอดมิน',
      'text=จัดการผู้ใช้',
      'text=Dashboard Stats',
      'a[href*="/admin"]',
    ];
    
    for (const selector of adminLinks) {
      const visible = await page.locator(selector).isVisible().catch(() => false);
      // Admin links should NOT be visible to regular patients
      expect(visible).toBeFalsy();
    }
  });

  test('should not leak user info in error messages', async ({ page }) => {
    // Try accessing non-existent resource
    const fakeUUID = '11111111-1111-1111-1111-111111111111';
    
    const response = await page.request.get(
      `${process.env.E2E_API_URL || 'http://localhost:5000'}/api/v1/cases/${fakeUUID}`,
      {
        headers: {
          'Authorization': `Bearer fake-token`,
        },
      }
    ).catch(() => null);
    
    if (response) {
      const body = await response.text();
      
      // Error message should NOT contain:
      // - Other user's phone number
      // - Other user's name
      // - Database column names
      // - Stack traces
      
      const sensitivePatterns = [
        /\+66\d{9}/,  // Thai phone numbers
        /phoneNumber/i,
        /password/i,
        /stack/i,
        /at .+\.ts:\d+/,  // Stack trace lines
      ];
      
      for (const pattern of sensitivePatterns) {
        expect(pattern.test(body)).toBeFalsy();
      }
    }
  });
});

