/**
 * Playwright Test Fixtures
 * 
 * Provides test data and helper functions
 */

import { test as base, expect, Page } from '@playwright/test';

// Test user credentials (must match seed-test-data.ts)
export const TEST_CREDENTIALS = {
  patient: {
    phone: '0811111111',
    password: 'TestPatient123!',
  },
  doctor: {
    phone: '0822222222',
    password: 'TestDoctor123!',
  },
  admin: {
    phone: '0833333333',
    password: 'TestAdmin123!',
  },
};

// Extended test fixture with helper methods
export const test = base.extend<{
  loginAsPatient: () => Promise<void>;
  loginAsDoctor: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}>({
  loginAsPatient: async ({ page }, use) => {
    const login = async () => {
      await loginUser(page, TEST_CREDENTIALS.patient.phone);
    };
    await use(login);
  },
  loginAsDoctor: async ({ page }, use) => {
    const login = async () => {
      await loginUser(page, TEST_CREDENTIALS.doctor.phone, '/admin');
    };
    await use(login);
  },
  loginAsAdmin: async ({ page }, use) => {
    const login = async () => {
      await loginUser(page, TEST_CREDENTIALS.admin.phone, '/admin');
    };
    await use(login);
  },
});

async function loginUser(page: Page, phone: string, path: string = '/') {
  await page.goto(path);
  
  // Wait for login screen
  await page.waitForSelector('input[type="tel"], input[placeholder*="เบอร์โทร"], input[placeholder*="phone"]');
  
  // Enter phone number
  await page.fill('input[type="tel"], input[placeholder*="เบอร์โทร"], input[placeholder*="phone"]', phone);
  
  // Click request OTP button
  await page.click('button:has-text("ขอ OTP"), button:has-text("OTP"), button[type="submit"]');
  
  // In test environment, OTP is usually auto-verified or we have a test OTP
  // Wait for OTP input or dashboard
  await page.waitForTimeout(1000);
  
  // If OTP input appears, enter test code
  const otpInput = page.locator('input[placeholder*="OTP"], input[maxlength="6"], input[maxlength="4"]');
  if (await otpInput.isVisible()) {
    await otpInput.fill('123456'); // Test OTP code
    await page.click('button:has-text("ยืนยัน"), button:has-text("Verify"), button[type="submit"]');
  }
  
  // Wait for login to complete
  await page.waitForTimeout(2000);
}

export { expect };

