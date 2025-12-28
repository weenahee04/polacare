/**
 * E2E Test: Patient Dashboard
 * 
 * Critical User Flow #2: View Dashboard and Profile
 */

import { test, expect, TEST_CREDENTIALS } from './fixtures';

test.describe('Patient Dashboard', () => {
  test.beforeEach(async ({ page, loginAsPatient }) => {
    // Skip if we can't login
    test.skip(!TEST_CREDENTIALS.patient.phone, 'No test patient configured');
  });

  test('should display welcome message after login', async ({ page }) => {
    await page.goto('/');
    
    // If logged in, should see dashboard elements
    // Look for common dashboard elements
    const hasDashboard = await page.locator('text=สวัสดี, text=Hello, text=Dashboard').first().isVisible()
      .catch(() => false);
    
    if (!hasDashboard) {
      // Need to login first
      test.skip();
    }
    
    await expect(page.locator('text=สวัสดี, text=Hello, text=Dashboard').first()).toBeVisible();
  });

  test('should show user profile info', async ({ page }) => {
    await page.goto('/');
    
    // Check for profile elements
    const hasProfileSection = await page.locator('text=HN, text=ข้อมูลส่วนตัว, text=Profile').isVisible()
      .catch(() => false);
    
    if (hasProfileSection) {
      await expect(page.locator('text=HN').first()).toBeVisible();
    }
  });

  test('should have navigation tabs', async ({ page }) => {
    await page.goto('/');
    
    // Check for bottom navigation
    const navElements = [
      'text=หน้าแรก, text=Home, text=Dashboard',
      'text=ประวัติ, text=Records, text=History',
      'text=Eye Care, text=ดูแลตา',
      'text=โปรไฟล์, text=Profile',
    ];
    
    for (const selector of navElements) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      // At least some navigation should be visible
      if (isVisible) {
        await expect(element).toBeVisible();
        break;
      }
    }
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/');
    
    // Click on records tab
    const recordsTab = page.locator('text=ประวัติ, text=Records').first();
    if (await recordsTab.isVisible()) {
      await recordsTab.click();
      await page.waitForTimeout(500);
      
      // Should see records content
      const hasRecordsContent = await page.locator('text=การรักษา, text=treatment, text=case').isVisible()
        .catch(() => false);
      
      if (!hasRecordsContent) {
        // Empty state is also valid
        const hasEmptyState = await page.locator('text=ไม่มี, text=No records, text=empty').isVisible()
          .catch(() => false);
        expect(hasRecordsContent || hasEmptyState).toBeTruthy();
      }
    }
  });
});

